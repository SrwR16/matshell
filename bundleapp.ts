/* Slightly different from app.ts. 
Used for bundled Nix package demo only.
Static CSS colors.  */
import { App, Gdk, Gtk } from "astal/gtk3";
import Bar from "./widgets/bar/main.tsx";
import OnScreenDisplay from "./widgets/osd/main.tsx";
import Notifications from "./widgets/notifications/main.tsx";
import SystemMenu from "./widgets/system-menu/main.tsx";
import MusicPlayer from "./widgets/music/main.tsx";
import Applauncher from "./widgets/launcher/main.tsx";
import LogoutMenu from "widgets/logout-menu/main.tsx";
import scss from "./style.scss";

App.start({
  icons: "./icons",
  css: scss,
  instanceName: "js",
  requestHandler(request, res) {
    print(request);
    res("ok");
  },
  main() {
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
