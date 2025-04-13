import { execAsync, GLib } from "astal";
import {
  initializeConfig,
  createOption,
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
      wallpaper: {
        folder: createOption<ConfigValue>(GLib.get_home_dir(), {
          useCache: true,
        }),
        current: createOption<ConfigValue>(currentWallpaper, {
          useCache: true,
        }),
      },
      bar: {
        position: createOption<ConfigValue>("top"), // "top", "bottom"
        margins: {
          top: createOption<ConfigValue>(5),
          left: createOption<ConfigValue>(5),
          right: createOption<ConfigValue>(5),
          bottom: createOption<ConfigValue>(0),
        },
        modules: {
          cava: {
            show: createOption<ConfigValue>(false),
            /* "catmull_rom", "smooth", "rounded", "bars","jumping_bars",
            "dots", "circular", "particles", "wave_particles","waterfall", "mesh" */
            style: createOption<ConfigValue>("catmull_rom"),
          },
          showOsIcon: createOption<ConfigValue>(true),
        },
      },
      musicPlayer: {
        modules: {
          cava: {
            show: createOption<ConfigValue>(true),
            /* "catmull_rom", "smooth", "rounded", "bars","jumping_bars",
            "dots", "circular", "particles", "wave_particles","waterfall", "mesh" */
            style: createOption<ConfigValue>("catmull_rom"),
          },
        },
      },
    },
  );

  saveConfig();
  return config;
})();

export default options;
