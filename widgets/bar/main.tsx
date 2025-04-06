import { Astal, Gtk, Gdk } from "astal/gtk4";
import SysTray from "./modules/SysTray.tsx";
import Separator from "./modules/Separator.tsx";
import Workspaces from "./modules/Workspaces.tsx";
import Mem from "./modules/Mem.tsx";
import Cpu from "./modules/Cpu.tsx";
import { CavaDraw } from "widgets/music/modules/Cava.tsx";
import Media from "./modules/Media.tsx";
import SystemInfo from "./modules/SystemInfo/main.tsx";
import Time from "./modules/Time.tsx/";
import OsIcon from "./modules/OsIcon.tsx";

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      cssClasses={["Bar"]}
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      margin_left={5}
      margin_right={5}
      margin_top={5}
    >
      <overlay>
        <box type="overlay clip">
          <CavaDraw />
        </box>
        <centerbox type= "overlay measure">
          <box hexpand halign={Gtk.Align.START}>
            <OsIcon />
            <Workspaces />
          </box>
          <box>
            <Media />
          </box>
          <box hexpand halign={Gtk.Align.END}>
            <SysTray />
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
