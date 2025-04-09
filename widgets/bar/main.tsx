import { Astal, Gtk, Gdk } from "astal/gtk4";
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

export default function Bar(monitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  // Set this to true for some action on the main bar.
  // Probably too distracting to leave this on all the time.
  let renderCava = false;

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
        {renderCava && (
          <box type="overlay clip">
            <CavaDraw 
            vexpand
            hexpand
            style={CavaStyle.SMOOTH}
            />
          </box>
        )}
        <centerbox type="overlay measure">
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
