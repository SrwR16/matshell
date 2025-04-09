import { Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";
import { isIcon } from "utils/notifd";

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
