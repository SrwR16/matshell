import { execAsync, GLib } from "astal";
import {
  initializeConfig,
  defineOption, // Renamed for clarity
  ConfigValue,
  saveConfig,
} from "./utils/option";

const options = await (async () => {
  const currentWallpaper = await execAsync(
    "hyprctl hyprpaper listloaded",
  ).catch(() => "");

  const config = initializeConfig(
    `${GLib.get_user_config_dir()}/ags/config.json`,
    {
      "wallpaper.folder": defineOption<ConfigValue>(GLib.get_home_dir(), {
        useCache: true,
      }),
      "wallpaper.current": defineOption<ConfigValue>(currentWallpaper, {
        useCache: true,
      }),
      "bar.position": defineOption<ConfigValue>("top"), // "top", "bottom"
      "bar.margins.top": defineOption<ConfigValue>(5),
      "bar.margins.left": defineOption<ConfigValue>(5),
      "bar.margins.right": defineOption<ConfigValue>(5),
      "bar.margins.bottom": defineOption<ConfigValue>(0),
      "bar.modules.cava.show": defineOption<ConfigValue>(false),
      /* "catmull_rom", "smooth", "rounded", "bars","jumping_bars",
      "dots", "circular", "particles", "wave_particles","waterfall", "mesh" */
      "bar.modules.cava.style": defineOption<ConfigValue>("catmull_rom"),
      "bar.modules.media.cava.show": defineOption<ConfigValue>(true),
      "bar.modules.media.cava.style": defineOption<ConfigValue>("circular"),
      "bar.modules.showOsIcon": defineOption<ConfigValue>(true),
      "musicPlayer.modules.cava.show": defineOption<ConfigValue>(true),
      "musicPlayer.modules.cava.style":
        defineOption<ConfigValue>("catmull_rom"),
    },
  );

  saveConfig();
  return config;
})();

export default options;
