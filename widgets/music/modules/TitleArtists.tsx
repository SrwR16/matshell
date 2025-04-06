import { Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";

export function Title({ player }: { player: Mpris.Player }) {
  return (
    <Gtk.ScrolledWindow
      cssClasses={["title"]}
      vexpand={true}
      heightRequest={12}
      vscrollbarPolicy={Gtk.PolicyType.NEVER}
      hscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
    >
      <label
        cssClasses={["title"]}
        label={bind(player, "title").as((t) => t || "Nothing playing")}
      />
    </Gtk.ScrolledWindow>
  );
}

export function Artists({ player }: { player: Mpris.Player }) {
  return (
    <Gtk.ScrolledWindow
      cssClasses={["artists"]}
      vexpand={true}
      vscrollbarPolicy={Gtk.PolicyType.NEVER}
      hscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
    >
      <label
        cssClasses={["artists"]}
        label={bind(player, "artist").as((a) => a || "")}
      />
    </Gtk.ScrolledWindow>
  );
}
