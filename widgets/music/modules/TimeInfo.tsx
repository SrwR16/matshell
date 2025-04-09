import Mpris from "gi://AstalMpris";
import { bind } from "astal";
import { lengthStr } from "utils/mpris";

function PositionLabel({ player }: { player: Mpris.Player }) {
  return (
    <label
      cssClasses={["position"]}
      xalign={0}
      label={bind(player, "position").as((pos) =>
        player.length > 0 ? lengthStr(pos) : "",
      )}
    ></label>
  );
}

function LengthLabel({ player }: { player: Mpris.Player }) {
  return (
    <label
      cssClasses={["length"]}
      xalign={1}
      hexpand={true}
      visible={bind(player, "length").as((l) => l > 0)}
      label={bind(player, "length").as(lengthStr)}
    />
  );
}

function Position({ player }: { player: Mpris.Player }) {
  return (
    <slider
      cssClasses={["position"]}
      hexpand={true}
      visible={bind(player, "length").as((l) => l > 0)}
      value={bind(player, "position").as((p) =>
        player.length > 0 ? p / player.length : 0,
      )}
      //using scroll or valueChange signals will cause recursive update issues
      onButtonReleased={( self ) => (player.position = self.value * player.length)}
    />
  );
}

export function TimeInfo({ player }: { player: Mpris.Player }) {
  return (
    <box vertical vexpand={true}>
      <box hexpand={true}>
        <PositionLabel player={player} />
        <LengthLabel player={player} />
      </box>
      <Position player={player} />
    </box>
  );
}
