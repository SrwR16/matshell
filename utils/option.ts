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
 * To keep it simple, configuration exclusively
 * uses flattened dot notation for paths:
 * {
 *   "section.subsection.option": "value",
 *   "section.another.option": 123
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

// Reactive configuration option
export class ConfigOption<T extends ConfigValue> extends Variable<T> {
  readonly defaultValue: T;
  readonly useCache: boolean;
  readonly autoSave: boolean;
  readonly name: string;

  constructor(
    name: string,
    defaultValue: T,
    options: { useCache?: boolean; autoSave?: boolean } = {},
  ) {
    super(defaultValue);
    this.name = name;
    this.defaultValue = defaultValue;
    this.useCache = options.useCache || false;
    this.autoSave = options.autoSave ?? true;
  }

  // Allow direct value access
  get value(): T {
    return super.get();
  }

  set value(newValue: T) {
    super.set(newValue);
  }
}

// Configuration manager
export class ConfigManager {
  private options: Map<string, ConfigOption<ConfigValue>> = new Map();
  private cacheDir: string;
  private lastLoadTime: number = 0;
  private subscriptions: Map<string, () => void> = new Map();

  constructor(public readonly configPath: string) {
    this.cacheDir = `${GLib.get_user_cache_dir()}/ags`;
    this.ensureDirectory(this.cacheDir);
    this.ensureDirectory(configPath.split("/").slice(0, -1).join("/"));
  }

  // Create and register option
  createOption<T extends ConfigValue>(
    name: string,
    defaultValue: T,
    options: { useCache?: boolean; autoSave?: boolean } = {},
  ): ConfigOption<T> {
    if (!name.includes(".")) {
      console.warn(
        `Warning: Config key "${name}" doesn't use dot notation. This is allowed but not recommended.`,
      );
    }

    const option = new ConfigOption<T>(name, defaultValue, options);
    this.options.set(name, option as ConfigOption<ConfigValue>);
    this.initializeOption(option);

    // Add auto-save for non-cached options
    if (!option.useCache && option.autoSave) {
      option.subscribe(() => {
        console.log(`Auto-saving due to change in ${name}`);
        this.save();
      });
    }

    return option;
  }

  // Initialize option from saved values
  private initializeOption<T extends ConfigValue>(
    option: ConfigOption<T>,
  ): void {
    const filePath = option.useCache
      ? `${this.cacheDir}/options.json`
      : this.configPath;

    if (GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
      try {
        const config = JSON.parse(readFile(filePath) || "{}");
        if (config[option.name] !== undefined) {
          option.value = config[option.name] as T;
        }
      } catch (err) {
        console.error(`Failed to initialize option ${option.name}:`, err);
      }
    }

    // Setup cache saving with proper cleanup handling
    if (option.useCache) {
      // Clean up any existing subscription first
      if (this.subscriptions.has(option.name)) {
        const existingCleanup = this.subscriptions.get(option.name);
        if (existingCleanup) existingCleanup();
      }

      // Create new subscription and store the cleanup function
      const cleanup = option.subscribe((value) => {
        this.saveCachedValue(option.name, value);
      });

      this.subscriptions.set(option.name, cleanup);
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

  // Save all non-cached configuration values to file
  save(): void {
    try {
      // Check if file exists
      const fileExists = GLib.file_test(this.configPath, GLib.FileTest.EXISTS);

      if (!fileExists) {
        // Simply create a new file with all non-cached options
        const newConfig: Record<string, ConfigValue> = {};
        for (const [name, option] of this.options.entries()) {
          if (!option.useCache) {
            newConfig[name] = option.value;
          }
        }
        writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
        console.log("Created new configuration file with defaults");
        return;
      }

      // Check if the file was modified since last load
      const fileInfo = Gio.File.new_for_path(this.configPath).query_info(
        "time::modified",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
      const modTime = fileInfo.get_modification_time().tv_sec;

      if (modTime > this.lastLoadTime && this.lastLoadTime !== 0) {
        console.warn(
          "Configuration file was modified externally. Reading changes first.",
        );
        this.load(); // Reload to get external changes before saving
      }

      // Read existing config to compare
      const existingConfig = JSON.parse(readFile(this.configPath) || "{}");

      // Prepare new config
      const newConfig: Record<string, ConfigValue> = {};
      let hasChanges = false;

      for (const [name, option] of this.options.entries()) {
        if (!option.useCache) {
          newConfig[name] = option.value;

          // Check if this value changed
          if (
            JSON.stringify(existingConfig[name]) !==
            JSON.stringify(option.value)
          ) {
            hasChanges = true;
          }
        }
      }

      // Only write the file if there are changes
      if (hasChanges) {
        writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
        console.log("Saved configuration changes");
      } else {
        console.log("No configuration changes to save");
      }
    } catch (err) {
      console.error(`Failed to save configuration: ${err}`);
    }
  }

  // Load all configuration values from file
  load(): void {
    console.log(`Loading configuration from ${this.configPath}`);

    if (!GLib.file_test(this.configPath, GLib.FileTest.EXISTS)) {
      console.log(`Configuration file doesn't exist, creating with defaults`);
      this.save();
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
          option.value = config[name];
          loadedCount++;
        }
      }

      // Record the time when we loaded the file
      const fileInfo = Gio.File.new_for_path(this.configPath).query_info(
        "time::modified",
        Gio.FileQueryInfoFlags.NONE,
        null,
      );
      this.lastLoadTime = fileInfo.get_modification_time().tv_sec;

      console.log(`Applied ${loadedCount} settings from configuration file`);
    } catch (err) {
      console.error(`Failed to load configuration: ${err}`);
    }
  }

  // Watch for configuration file changes
  watchChanges(): void {
    monitorFile(this.configPath, (_, event) => {
      if (
        event === Gio.FileMonitorEvent.CHANGED ||
        event === Gio.FileMonitorEvent.CHANGES_DONE_HINT ||
        event === Gio.FileMonitorEvent.ATTRIBUTE_CHANGED ||
        event === Gio.FileMonitorEvent.CREATED
      ) {
        console.log("Config file changed, reloading...");
        this.load();
      }
    });
  }

  // Get an option by name
  getOption<T extends ConfigValue>(name: string): ConfigOption<T> | undefined {
    return this.options.get(name) as ConfigOption<T> | undefined;
  }

  // Get all options
  getAllOptions(): Map<string, ConfigOption<ConfigValue>> {
    return this.options;
  }
}

// Global configuration manager instance
let configManager: ConfigManager | null = null;

// Public API

/**
 * Define a configuration option with metadata
 */
export function defineOption<T extends ConfigValue>(
  defaultValue: T,
  options: { useCache?: boolean; autoSave?: boolean } = {},
): { defaultValue: T; useCache?: boolean; autoSave?: boolean } {
  return {
    defaultValue,
    useCache: options.useCache,
    autoSave: options.autoSave,
  };
}

/**
 * Initializes configuration with flattened dot notation
 */
export function initializeConfig(
  configPath: string,
  config: Record<
    string,
    { defaultValue: ConfigValue; useCache?: boolean; autoSave?: boolean }
  >,
): Record<string, ConfigOption<ConfigValue>> {
  // Create the config manager
  configManager = new ConfigManager(configPath);

  // Create options from flattened config
  const options: Record<string, ConfigOption<ConfigValue>> = {};

  for (const [path, def] of Object.entries(config)) {
    options[path] = configManager.createOption(path, def.defaultValue, {
      useCache: def.useCache,
      autoSave: def.autoSave,
    });
  }

  // Load the saved values
  configManager.load();

  // Set up file watching
  configManager.watchChanges();

  return options;
}

/**
 * Manually save all configuration options to disk
 */
export function saveConfig(): void {
  if (configManager) {
    configManager.save();
  }
}

/**
 * Get a specific configuration option by path
 */
export function retrieveOption<T extends ConfigValue>(
  path: string,
): ConfigOption<T> | undefined {
  if (!configManager) {
    throw new Error(
      "Configuration not initialized. Call initializeConfig first.",
    );
  }

  return configManager.getOption<T>(path);
}
