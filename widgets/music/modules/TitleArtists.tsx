import { Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";

export function Title({ player }: { player: Mpris.Player }) {
  return (
    <scrollable
      className="title"
      vexpand={true}
      heightRequest={12}
      vscroll={Gtk.PolicyType.NEVER}
      hscroll={Gtk.PolicyType.AUTOMATIC}
    >
      <label
        className="title"
        label={bind(player, "title").as((t) => t || "Nothing playing")}
      />
    </scrollable>
  );
}

export function Artists({ player }: { player: Mpris.Player }) {
  return (
    <scrollable
      className="artists"
      vexpand={true}
      vscroll={Gtk.PolicyType.NEVER}
      hscroll={Gtk.PolicyType.AUTOMATIC}
    >
      <label
        className="artists"
        label={bind(player, "artist").as((a) => a || "")}
      />
    </scrollable>
  );
}
