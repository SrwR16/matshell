import { Astal, Gtk, Gdk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";

const isIcon = (icon: string) => {
  const display = Gdk.Display.get_default();
  if (!display) return false;
  const iconTheme = Gtk.IconTheme.get_for_display(display);
  return iconTheme.has_icon(icon);
};
export function PlayerInfo({ player }: { player: Mpris.Player }) {
  const { START, END } = Gtk.Align;
  return (
    <box cssClasses={["player-info"]} halign={END}>
      <image
        cssClasses={["player-icon"]}
        halign={END}
        tooltipText={bind(player, "identity")}
        iconName={bind(player, "entry").as((entry) => {
          if (entry === "spotify") entry = "spotify-client";
          return isIcon(entry ?? "")
            ? entry
            : "multimedia-player-symbolic";
        })}
      />
    </box>
  );
}
