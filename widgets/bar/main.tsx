import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { idle, bind } from "astal";
import SysTray from "./modules/SysTray.tsx";
import Separator from "./modules/Separator.tsx";
import Workspaces from "./modules/Workspaces.tsx";
import Mem from "./modules/Mem.tsx";
import Cpu from "./modules/Cpu.tsx";
import { CavaDraw, CavaStyle } from "widgets/music/modules/Cava.tsx";
import Media from "./modules/Media.tsx";
import SystemInfo from "./modules/SystemInfo/main.tsx";
import Time from "./modules/Time.tsx/";
import OsIcon from "./modules/OsIcon.tsx";
import options from "options.ts";

function Bar({ gdkmonitor, ...props }: any) {
  console.log("Bar initialization started");

  const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

  // Calculate anchor based on position
  const getAnchor = (position: string) => {
    switch (position) {
      case "top":
        return TOP | LEFT | RIGHT;
      case "bottom":
        return BOTTOM | LEFT | RIGHT;
      default:
        return TOP | LEFT | RIGHT;
    }
  };

  return (
    <window
      visible
      setup={(self) => self.set_default_size(1, 1)}
      name="bar"
      namespace="bar"
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      application={App}
      anchor={getAnchor(options.bar.position.get())}
      margin_top={bind(options.bar.margins.top)}
      margin_left={bind(options.bar.margins.left)}
      margin_right={bind(options.bar.margins.right)}
      margin_bottom={bind(options.bar.margins.bottom)}
      {...props}
    >
      <overlay>
        <box type="overlay clip" visible={bind(options.bar.modules.showCava)}>
          <CavaDraw vexpand hexpand style={CavaStyle.CATMULL_ROM} />
        </box>
        <centerbox type="overlay measure">
          <box hexpand halign={Gtk.Align.START}>
            <box visible={bind(options.bar.modules.showOsIcon)}>
              <OsIcon />
            </box>
            <Workspaces />
          </box>
          <box>
            <Media />
          </box>
          <box hexpand halign={Gtk.Align.END}>
            <SysTray />
            <Separator />
            <Cpu />
            <Mem />
            <Separator />
            <SystemInfo />
            <Separator />
            <Time />
          </box>
        </centerbox>
      </overlay>
    </window>
  );
}

export default function (monitor: Gdk.Monitor) {
  function createBar() {
    console.log("Creating bar for monitor");
    <Bar gdkmonitor={monitor} />;
  }

  // Create the initial bar
  createBar();

  options.bar.position.subscribe(() => {
    console.log("Position changed, recreating bar");
    const barWindow = App.get_window("bar");
    if (barWindow) {
      App.toggle_window("bar");
      barWindow.set_child(null);
      App.remove_window(barWindow);
      idle(createBar);
    }
  });
}
