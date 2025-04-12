/**
 * Configuration Management System
 *
 * A reactive configuration system for managing application settings,
 * with support for file monitoring, caching, and structured updates.
 *
 * @see https://github.com/ezerinz/epik-shell
 */

import {
  readFile,
  readFileAsync,
  writeFile,
  Variable,
  GLib,
  Gio,
  monitorFile,
} from "astal";

/**
 * Represents all possible configuration value types
 */
type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigObject
  | ConfigArray;

/**
 * Represents a configuration object structure
 */
interface ConfigObject {
  [key: string]: ConfigValue;
}

/**
 * Represents an array of configuration values
 */
type ConfigArray = ConfigValue[];

/**
 * Represents a configuration item that can be either an option or an object
 */
type ConfigItem = ConfigOption<ConfigValue> | ConfigObject;

/**
 * Represents values that can be serialized
 */
type SerializableValue =
  | ConfigValue
  | ConfigOption<ConfigValue>
  | SerializableObject;

/**
 * Represents an object with serializable values
 */
interface SerializableObject {
  [key: string]: SerializableValue;
}

/**
 * Represents a nested configuration structure
 */
type ConfigStructure = {
  [key: string]: ConfigOption<ConfigValue> | ConfigObject | ConfigStructure;
};

/**
 * Extends a configuration type with helper methods
 */
type ConfigWithHelpers<T> = T & {
  configPath: string;
  watchChanges: (paths: string[], callback: () => void) => void;
};

/**
 * Directory for caching configuration values
 */
const cacheDir = `${GLib.get_user_cache_dir()}/ags`;

/**
 * Ensures a directory exists, creating it if necessary
 */
function ensureDirectory(path: string): void {
  if (!GLib.file_test(path, GLib.FileTest.EXISTS))
    Gio.File.new_for_path(path).make_directory_with_parents(null);
}

/**
 * Performs a deep equality check between two values
 */
function deepEqual(
  a: ConfigValue | undefined,
  b: ConfigValue | undefined,
  visited = new WeakMap(),
): boolean {
  if (a === b) return true;

  if (a === null || b === null || a === undefined || b === undefined)
    return a === b;

  if (typeof a !== "object" || typeof b !== "object") return a === b;

  if (typeof a === "object" && a !== null) {
    if (visited.has(a)) return visited.get(a) === b;
    visited.set(a, b);
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  // If one is array and other isn't
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // Both are objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual(a[key as keyof typeof a], b[key as keyof typeof b]),
  );
}

/**
 * Retrieves a deeply nested value from an object using dot notation
 */
function getNestedProperty(
  obj: ConfigObject,
  propertyPath: string,
): ConfigValue | undefined {
  return propertyPath
    .split(".")
    .reduce<ConfigValue | undefined>((current, key) => {
      if (
        current &&
        typeof current === "object" &&
        !Array.isArray(current) &&
        key in current
      ) {
        return current[key];
      }
      return undefined;
    }, obj as ConfigValue);
}

/**
 * Sets a deeply nested value in an object using dot notation
 */
function setNestedProperty<T extends ConfigValue>(
  obj: ConfigObject,
  propertyPath: string,
  value: T,
): void {
  const keys = propertyPath.split(".");
  const lastKey = keys.pop();

  if (!lastKey) return;

  // Create path if it doesn't exist
  const target = keys.reduce((current, key) => {
    current[key] = current[key] || {};
    return current[key] as ConfigObject;
  }, obj);

  target[lastKey] = value;
}

/**
 * Maps all ConfigOption instances in an object structure with their paths
 */
function mapConfigOptionPaths(
  object: ConfigStructure,
  basePath = "",
): Map<string, ConfigOption<ConfigValue>> {
  const optionsMap = new Map<string, ConfigOption<ConfigValue>>();

  Object.entries(object).forEach(([key, value]) => {
    const fullPath = basePath ? `${basePath}.${key}` : key;

    if (value instanceof ConfigOption) {
      optionsMap.set(fullPath, value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedMap = mapConfigOptionPaths(
        value as ConfigStructure,
        fullPath,
      );
      nestedMap.forEach((option, path) => {
        optionsMap.set(path, option);
      });
    }
  });

  return optionsMap;
}

/**
 * Converts a configuration object tree to a plain object
 */
function serializeConfig(
  obj: SerializableValue,
  useDefaultValues = false,
): ConfigValue | undefined {
  if (obj instanceof ConfigOption) {
    // Skip cached options when serializing
    if (obj.useCache) return undefined;
    return useDefaultValues ? obj.defaultValue : obj.get();
  }

  if (!obj || typeof obj !== "object" || Array.isArray(obj))
    return obj as ConfigValue;

  const result: ConfigObject = {};
  let hasProperties = false;

  for (const [key, value] of Object.entries(obj as SerializableObject)) {
    const serialized = serializeConfig(value, useDefaultValues);
    if (serialized !== undefined) {
      result[key] = serialized;
      hasProperties = true;
    }
  }

  return hasProperties ? result : undefined;
}

/**
 * Recursively merges two objects
 */
function deepMergeObjects<T extends ConfigObject>(
  target: T,
  source: Partial<T>,
): T {
  if (!target || typeof target !== "object") return (source as T) || ({} as T);
  if (!source || typeof source !== "object") return (source as T) || target;

  const result = { ...target } as T;

  // Get string keys from source
  const keys = Object.keys(source) as Array<Extract<keyof T, string>>;

  // Process each key properly typed
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (Array.isArray(sourceValue)) {
        // For arrays, create a copy
        result[key] = [...sourceValue] as unknown as T[typeof key];
      } else if (sourceValue && typeof sourceValue === "object") {
        // For objects, recursively merge
        result[key] = (targetValue &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue)
          ? deepMergeObjects(
              targetValue as unknown as ConfigObject,
              sourceValue as unknown as ConfigObject,
            )
          : sourceValue) as unknown as T[typeof key];
      } else {
        result[key] = sourceValue as unknown as T[typeof key];
      }
    }
  }

  return result;
}

/**
 * Represents a configuration option with reactive updates
 */
export class ConfigOption<T extends ConfigValue> extends Variable<T> {
  readonly defaultValue: T;
  path = "";
  useCache = false;

  constructor(defaultValue: T, options: { useCache?: boolean } = {}) {
    super(defaultValue);
    this.defaultValue = defaultValue;
    this.useCache = options.useCache || false;
  }

  set(value: T): void {
    super.set(value);
  }

  get(): T {
    return super.get();
  }

  subscribe(callback: (value: T) => void): () => void {
    return super.subscribe(callback);
  }

  /**
   * Initializes the option with values from configuration file
   */
  initialize(configPath: string): void {
    const filePath = this.useCache ? `${cacheDir}/options.json` : configPath;

    if (GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
      try {
        const config = JSON.parse(readFile(filePath) || "{}") as ConfigObject;
        let storedValue: ConfigValue | undefined;

        if (this.useCache) {
          storedValue = config[this.path];
        } else {
          storedValue = getNestedProperty(config, this.path);
        }

        if (storedValue !== undefined) {
          this.set(storedValue as T);
        }
      } catch (err) {
        console.error(`Failed to initialize option at ${this.path}:`, err);
      }
    }

    if (this.useCache) {
      this.subscribe(this.saveCachedValue);
    }
  }

  /**
   * Saves the current value to the cache file
   */
  private saveCachedValue = (value: T): void => {
    type CacheObject = Record<string, ConfigValue>;

    readFileAsync(`${cacheDir}/options.json`)
      .then((content): void => {
        const cache: CacheObject = JSON.parse(content || "{}");
        cache[this.path] = value;
        writeFile(`${cacheDir}/options.json`, JSON.stringify(cache, null, 2));
      })
      .catch((err: unknown): void => {
        console.error(`Failed to save cached value for ${this.path}:`, err);
      });
  };
}

/**
 * Creates a new configuration option
 */
export const createOption = <T extends ConfigValue>(
  defaultValue: T,
  options = {},
) => new ConfigOption(defaultValue, options);

/**
 * Initializes a configuration system
 */
export function initializeConfig<T extends Record<string, ConfigItem>>(
  configPath: string,
  configObject: T,
): ConfigWithHelpers<T> {
  // Initialize all options
  const configOptionsMap = mapConfigOptionPaths(configObject);
  const configOptions = Array.from(configOptionsMap.entries()).map(
    ([path, option]) => {
      option.path = path;
      return option;
    },
  );
  configOptions.forEach((option) => option.initialize(configPath));

  // Ensure config directory exists
  const configDir = configPath.split("/").slice(0, -1).join("/");
  ensureDirectory(configDir);

  // Create config state
  const defaultConfig = serializeConfig(configObject, true);
  const currentConfig = Variable(serializeConfig(configObject) || {});

  // Load existing configuration if available
  if (GLib.file_test(configPath, GLib.FileTest.EXISTS)) {
    try {
      const savedConfig = JSON.parse(readFile(configPath) || "{}");
      currentConfig.set(deepMergeObjects(currentConfig.get(), savedConfig));
    } catch {
      // If parsing fails, keep using defaults
    }
  }

  /**
   * Updates configuration options when the file changes
   */
  function applyConfigChanges(
    oldConfig: ConfigObject,
    newConfig: ConfigObject,
    path = "",
  ): void {
    for (const key in newConfig) {
      const fullPath = path ? `${path}.${key}` : key;
      const newValue = newConfig[key];
      const oldValue = oldConfig?.[key];

      if (
        newValue &&
        typeof newValue === "object" &&
        !Array.isArray(newValue)
      ) {
        applyConfigChanges(
          (oldValue as ConfigObject) || {},
          newValue as ConfigObject,
          fullPath,
        );
      } else if (!deepEqual(oldValue, newValue)) {
        const option = configOptionsMap.get(fullPath);

        if (option) {
          console.log(`Config updated: ${fullPath}`);
          const updatedConfig = currentConfig.get();
          setNestedProperty(updatedConfig, fullPath, newValue);
          currentConfig.set(updatedConfig);
          option.set(newValue);
        }
      }
    }
  }

  // Monitor config file for changes
  monitorFile(configPath, (_, event) => {
    if (event === Gio.FileMonitorEvent.ATTRIBUTE_CHANGED) {
      try {
        const fileConfig = JSON.parse(readFile(configPath) || "{}");

        // Verify that both are objects before merging
        const defaultConfigObj =
          defaultConfig &&
          typeof defaultConfig === "object" &&
          !Array.isArray(defaultConfig)
            ? (defaultConfig as ConfigObject)
            : {};

        const fileConfigObj =
          fileConfig &&
          typeof fileConfig === "object" &&
          !Array.isArray(fileConfig)
            ? (fileConfig as ConfigObject)
            : {};

        applyConfigChanges(
          currentConfig.get(),
          deepMergeObjects(defaultConfigObj, fileConfigObj),
        );
      } catch {
        // Ignore file read/parse errors
      }
    }
  });

  // Return enhanced configuration with helper methods
  const enhancedConfig = {
    ...configObject,
    configPath,
    watchChanges(paths: string[], callback: () => void) {
      for (const option of configOptions) {
        if (paths.some((path) => option.path.startsWith(path))) {
          option.subscribe(callback);
        }
      }
    },
  };

  return enhancedConfig as ConfigWithHelpers<T>;
}
