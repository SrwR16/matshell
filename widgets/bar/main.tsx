import { App, Astal, Gtk, Gdk } from "astal/gtk4";
import { bind } from "astal";
import { SysTray, hasTrayItems } from "./modules/SysTray.tsx";
import Separator from "./modules/Separator.tsx";
import Workspaces from "./modules/Workspaces.tsx";
import Mem from "./modules/Mem.tsx";
import Cpu from "./modules/Cpu.tsx";
import { CavaDraw } from "widgets/music/modules/cava";
import Media from "./modules/Media.tsx";
import { hasActivePlayers } from "utils/mpris.ts";
import SystemInfo from "./modules/SystemInfo/main.tsx";
import Time from "./modules/Time.tsx/";
import OsIcon from "./modules/OsIcon.tsx";
import options from "options.ts";

function Bar({ gdkmonitor, ...props }: any) {
  console.log("Bar initialization started");

  const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;

  return (
    <window
      visible
      setup={(self) => self.set_default_size(1, 1)}
      name="bar"
      namespace="bar"
      cssClasses={bind(options["bar.style"]).as((style) => {
        return ["Bar", `bar-style-${style}`];
      })}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      application={App}
      anchor={bind(options["bar.position"]).as((pos) => {
        switch (pos) {
          case "top":
            return TOP | LEFT | RIGHT;
          case "bottom":
            return BOTTOM | LEFT | RIGHT;
          default:
            return TOP | LEFT | RIGHT;
        }
      })}
      marginTop={bind(options["bar.position"]).as((pos) => {
        if (pos === "top") return 5;
        else return 0;
      })}
      marginLeft={5}
      marginRight={5}
      marginBottom={bind(options["bar.position"]).as((pos) => {
        if (pos === "bottom") return 5;
        else return 0;
      })}
      {...props}
    >
      <overlay>
        <box
          type="overlay clip"
          visible={bind(options["bar.modules.cava.show"])}
        >
          <CavaDraw
            vexpand
            hexpand
            style={bind(options["bar.modules.cava.style"])}
          />
        </box>
        <centerbox type="overlay measure" cssClasses={["centerbox"]}>
          <box hexpand halign={Gtk.Align.START}>
            <box visible={bind(options["bar.modules.showOsIcon"])}>
              <OsIcon />
            </box>
            <Workspaces />
          </box>
          <box visible={bind(hasActivePlayers)}>
            <Media />
          </box>
          <box hexpand halign={Gtk.Align.END}>
            <SysTray />
            <Separator visible={bind(hasTrayItems)} />
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
  const windowName = `bar-${monitor.get_connector()}`;

  function createBar() {
    console.log(`Creating bar for monitor ${monitor.get_connector()}`);
    return <Bar gdkmonitor={monitor} name={windowName} />;
  }

  // Create the initial bar
  createBar();

  return windowName;
}
