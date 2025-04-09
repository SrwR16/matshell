import { App, Gdk, Gtk } from "astal/gtk4";
import { monitorFile } from "astal/file";
import { exec } from "astal/process";
import Bar from "./widgets/bar/main.tsx";
import SystemMenu from "./widgets/system-menu/main.tsx";
import OnScreenDisplay from "./widgets/osd/main.tsx";
import Notifications from "./widgets/notifications/main.tsx";
import LogoutMenu from "widgets/logout-menu/main.tsx";
import Applauncher from "./widgets/launcher/main.tsx";
import MusicPlayer from "./widgets/music/main.tsx";

const scss = "./style.scss";
const css = "./style.css";

function reloadCss() {
  console.log("scss change detected");
  exec(`sass ${scss} ${css}`);
  App.apply_css(css);
}

App.start({
  icons: "./assets/icons",
  css: css,
  instanceName: "js",
  requestHandler(request, res) {
    print(request);
    res("ok");
  },
  main() {
    exec(`sass ${scss} ${css}`);
    monitorFile(`./style`, reloadCss);
    const bars = new Map<Gdk.Monitor, Gtk.Widget>();

    Notifications();
    OnScreenDisplay();
    SystemMenu();
    MusicPlayer();
    Applauncher();
    LogoutMenu();

    // initialize
    for (const gdkmonitor of App.get_monitors()) {
      bars.set(gdkmonitor, Bar(gdkmonitor));
    }

    App.connect("monitor-added", (_, gdkmonitor) => {
      bars.set(gdkmonitor, Bar(gdkmonitor));
    });

    App.connect("monitor-removed", (_, gdkmonitor) => {
      bars.get(gdkmonitor)?.destroy();
      bars.delete(gdkmonitor);
    });
  },
});
