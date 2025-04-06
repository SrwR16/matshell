import { Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";

export function Cover({ player }: { player: Mpris.Player }) {
  return (
    <image
      cssClasses={["cover"]}
      overflow={Gtk.Overflow.HIDDEN}
      file={bind(player, "coverArt")}
    />
  );
}
