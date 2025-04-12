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
 * Configuration manager for Astal/AGS
 *
 * To keep it simple, configuration files should use flattened dot notation for paths:
 * {
 *   "section.subsection.option": "value",
 *   "section.another.option": 123
 * }
 *
 * Rather than nested objects:
 * {
 *   "section": {
 *     "subsection": {
 *       "option": "value"
 *     }
 *   }
 * }
 */
export interface ConfigValueObject {
  [key: string]: ConfigValue;
}
export interface ConfigValueArray extends Array<ConfigValue> {}

export type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigValueObject
  | ConfigValueArray;

// Define a recursive type to properly transform the config structure
type ConfigOptionsOf<T> = {
  [K in keyof T]: T[K] extends { defaultValue: any }
    ? ConfigOption<T[K]["defaultValue"] & ConfigValue>
    : T[K] extends object
      ? ConfigOptionsOf<T[K]>
      : T[K];
};

// Reactive configuration option
export class ConfigOption<T extends ConfigValue> extends Variable<T> {
  readonly defaultValue: T;
  useCache: boolean;
  name: string = "";

  constructor(defaultValue: T, options: { useCache?: boolean } = {}) {
    super(defaultValue);
    this.defaultValue = defaultValue;
    this.useCache = options.useCache || false;
  }

  // Use parent's get method directly
  get(): T {
    return super.get();
  }

  // Use parent's set method directly
  set(value: T): void {
    super.set(value);
  }

  // Simply pass through parent's subscribe method
  subscribe(callback: (value: T) => void): any {
    return super.subscribe(callback);
  }

  // Allow direct value access
  get value(): T {
    return this.get();
  }

  set value(newValue: T) {
    this.set(newValue);
  }
}

// Configuration manager
export class ConfigManager {
  private options: Map<string, ConfigOption<ConfigValue>> = new Map();
  private cacheDir: string;

  constructor(public readonly configPath: string) {
    this.cacheDir = `${GLib.get_user_cache_dir()}/ags`;
    this.ensureDirectory(this.cacheDir);
    this.ensureDirectory(configPath.split("/").slice(0, -1).join("/"));
  }

  // Create and register an option
  createOption<T extends ConfigValue>(
    name: string,
    defaultValue: T,
    options: { useCache?: boolean; autoSave?: boolean } = {},
  ): ConfigOption<T> {
    const option = new ConfigOption<T>(defaultValue, options);
    option.name = name;
    this.options.set(name, option as ConfigOption<ConfigValue>);
    this.initializeOption(name, option);

    // Add auto-save for non-cached options
    if (!option.useCache && options.autoSave !== false) {
      option.subscribe(() => {
        console.log(`Auto-saving due to change in ${name}`);
        this.save();
      });
    }

    return option;
  }

  // Initialize option from saved values
  private initializeOption<T extends ConfigValue>(
    name: string,
    option: ConfigOption<T>,
  ): void {
    const filePath = option.useCache
      ? `${this.cacheDir}/options.json`
      : this.configPath;

    if (GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
      try {
        const config = JSON.parse(readFile(filePath) || "{}");
        if (config[name] !== undefined) {
          option.set(config[name] as T);
        }
      } catch (err) {
        console.error(`Failed to initialize option ${name}:`, err);
      }
    }

    // Setup cache saving - use connect instead of subscribe
    if (option.useCache) {
      const cleanup = option.subscribe((value) => {
        this.saveCachedValue(name, value);
      });
      // Store connection for cleanup if needed
    }
  }

  // Save a cached value
  private saveCachedValue(name: string, value: ConfigValue): void {
    readFileAsync(`${this.cacheDir}/options.json`)
      .then((content) => {
        const cache = JSON.parse(content || "{}");
        cache[name] = value;
        writeFile(
          `${this.cacheDir}/options.json`,
          JSON.stringify(cache, null, 2),
        );
      })
      .catch((err) => {
        console.error(`Failed to save cached value for ${name}:`, err);
      });
  }

  // Ensure directory exists
  private ensureDirectory(path: string): void {
    if (!GLib.file_test(path, GLib.FileTest.EXISTS)) {
      Gio.File.new_for_path(path).make_directory_with_parents(null);
    }
  }

  // Load all configuration values from file
  load(): void {
    console.log(`Loading configuration from ${this.configPath}`);

    if (!GLib.file_test(this.configPath, GLib.FileTest.EXISTS)) {
      console.log(`Configuration file doesn't exist, creating with defaults`);
      this.save(); // Create the file with defaults
      return;
    }

    try {
      const fileContent = readFile(this.configPath);
      if (!fileContent || fileContent.trim() === "") {
        console.log(`Configuration file is empty, using defaults`);
        this.save();
        return;
      }

      const config = JSON.parse(fileContent);
      console.log(
        `Loaded configuration with ${Object.keys(config).length} settings`,
      );

      let loadedCount = 0;
      for (const [name, option] of this.options.entries()) {
        if (!option.useCache && config[name] !== undefined) {
          option.set(config[name]);
          loadedCount++;
        }
      }

      console.log(`Applied ${loadedCount} settings from configuration file`);
    } catch (err) {
      console.error(`Failed to load configuration: ${err}`);
      // Create a backup of the corrupted file
      if (GLib.file_test(this.configPath, GLib.FileTest.EXISTS)) {
        const backupPath = `${this.configPath}.backup-${Date.now()}`;
        try {
          GLib.file_get_contents(this.configPath);
          GLib.file_set_contents(
            backupPath,
            GLib.file_get_contents(this.configPath)[1],
          );
          console.log(`Created backup of corrupted config at ${backupPath}`);
        } catch (backupErr) {
          console.error(`Could not create backup: ${backupErr}`);
        }
      }

      // Save defaults
      this.save();
    }
  }

  // Save all non-cached configuration values to file
  save(): void {
    const config: Record<string, ConfigValue> = {};
    for (const [name, option] of this.options.entries()) {
      if (!option.useCache) {
        config[name] = option.value;
      }
    }
    writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  // Watch for configuration file changes
  watchChanges(): void {
    monitorFile(this.configPath, (_, event) => {
      if (event === Gio.FileMonitorEvent.ATTRIBUTE_CHANGED) {
        this.load();
      }
    });
  }
}

// Initialize configuration
export function initConfig(configPath: string): ConfigManager {
  return new ConfigManager(configPath);
}

//
// ADAPTER FOR NESTED CONFIGURATION STRUCTURE
//

// Store a single instance of the config manager
let configManager: ConfigManager | null = null;

// Store options with their paths for retrieval
const optionsMap = new Map<string, ConfigOption<ConfigValue>>();

// Helper to flatten nested structure
function flattenPath(path: string[], key: string): string {
  return [...path, key].join(".");
}

// Recursive function to handle nested configuration
function processConfig(
  config: Record<string, any>,
  manager: ConfigManager,
  path: string[] = [],
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(config)) {
    if (value && typeof value === "object" && "defaultValue" in value) {
      // It's a ConfigOption-like object
      const flatKey = flattenPath(path, key);
      const option = manager.createOption(flatKey, value.defaultValue, {
        useCache: value.useCache || false,
      });

      optionsMap.set(flatKey, option);
      result[key] = option;
    } else if (value && typeof value === "object") {
      // It's a nested configuration object
      result[key] = processConfig(value, manager, [...path, key]);
    } else {
      // Shouldn't happen in normal usage
      result[key] = value;
    }
  }

  return result;
}

/**
 * Creates a configuration option with the given default value
 */

export function createOption<T extends ConfigValue>(
  defaultValue: T,
  options: { useCache?: boolean; autoSave?: boolean } = {},
): { defaultValue: T; useCache?: boolean; autoSave?: boolean } {
  return {
    defaultValue,
    useCache: options.useCache,
    autoSave: options.autoSave ?? true, // Enable auto-save by default
  };
}

export function getOption<T extends ConfigValue>(
  path: string,
): ConfigOption<T> {
  return optionsMap.get(path) as ConfigOption<T>;
}

/**
 * Initializes configuration with nested structure support
 */
export async function initializeConfig<T extends Record<string, any>>(
  configPath: string,
  config: T,
): Promise<ConfigOptionsOf<T>> {
  // Create the config manager
  configManager = new ConfigManager(configPath);

  // Process the nested configuration
  const result = processConfig(config, configManager) as T;

  // Load the saved values
  configManager.load();

  // Set up file watching
  configManager.watchChanges();

  return result;
}

/**
 * Manually save all configuration options to disk
 */
export function saveConfig(): void {
  if (configManager) {
    configManager.save();
  }
}
