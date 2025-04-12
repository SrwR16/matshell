import { execAsync, GLib } from "astal";
import { initializeConfig, createOption } from "./utils/option";

const options = await (async () => {
  const currentWallpaper = await execAsync(
    "hyprctl hyprpaper listloaded",
  ).catch(() => "");

  return initializeConfig(`${GLib.get_user_config_dir()}/ags/config.json`, {
    wallpaper: {
      folder: createOption(GLib.get_home_dir(), { useCache: true }),
      current: createOption(currentWallpaper, { useCache: true }),
    },
    bar: {
      position: createOption("top"), // "top", "bottom"
      margins: {
        top: createOption(5),
        left: createOption(5),
        right: createOption(5),
        bottom: createOption(0),
      },
      modules: {
        showCava: createOption(false),
        showOsIcon: createOption(true),
      },
    },
  });
})();

export default options;
