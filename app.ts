import { App } from "astal/gtk4";
import { exec, monitorFile, GLib } from "astal";
import { getNiriClient, niriToGdk } from "utils/niri.ts";
import Bar from "./widgets/bar/main.tsx";
import SystemMenu from "./widgets/system-menu/main.tsx";
import OnScreenDisplay from "./widgets/osd/main.tsx";
import Notifications from "./widgets/notifications/main.tsx";
import LogoutMenu from "widgets/logout-menu/main.tsx";
import Applauncher from "./widgets/launcher/main.tsx";
import MusicPlayer from "./widgets/music/main.tsx";
import ControlPanel from "./widgets/control-panel/main.tsx";

const scss = `${GLib.get_user_config_dir()}/ags/style/main.scss`;
const css = `${GLib.get_user_config_dir()}/ags/style/main.css`;
const icons = `${GLib.get_user_config_dir()}/ags/assets/icons`;
const styleDirectories = ["abstracts", "components", "layouts", "base"];

function reloadCss() {
  console.log("scss change detected");
  exec(`sass ${scss} ${css}`);
  App.apply_css(css);
}

App.start({
  icons: icons,
  css: css,
  instanceName: "js",
  requestHandler(request, res) {
    print(request);
    res("ok");
  },
  main() {
    exec(`sass ${scss} ${css}`);
    styleDirectories.forEach((dir) =>
      monitorFile(`${GLib.get_user_config_dir()}/ags/style/${dir}`, reloadCss),
    );

    const barNames = new Map<string, string>(); // Map output name to window name
    const niri = getNiriClient();

    Notifications();
    OnScreenDisplay();
    SystemMenu();
    MusicPlayer();
    Applauncher();
    LogoutMenu();
    ControlPanel();

    // Initialize bars for existing outputs
    niri.outputs.subscribe((outputs) => {
      for (const output of outputs) {
        if (!barNames.has(output.name)) {
          const gdkMonitor = niriToGdk(output);
          if (gdkMonitor) {
            const windowName = Bar(gdkMonitor);
            barNames.set(output.name, windowName);
            console.log(`Created bar for output: ${output.name}`);
          }
        }
      }

      // Remove bars for outputs that no longer exist
      for (const [outputName, windowName] of barNames.entries()) {
        const outputExists = outputs.some(output => output.name === outputName);
        if (!outputExists) {
          console.log(`Removing bar for disconnected output: ${outputName}`);
          const window = App.get_window(windowName);
          if (window) {
            App.toggle_window(windowName);
            window.set_child(null);
            App.remove_window(window);
          }
          barNames.delete(outputName);
        }
      }
    });
  },
});
