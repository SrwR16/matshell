import Mpris from "gi://AstalMpris";
import { PlayerInfo } from "./PlayerInfo";
import { Title, Artists } from "./TitleArtists";
import { Controls } from "./Controls";
import { TimeInfo } from "./TimeInfo";

export function Info({ player }: { player: Mpris.Player }) {
  return (
    <box vertical cssClasses={["info"]}>
      <PlayerInfo player={player} />
      <Title player={player} />
      <Artists player={player} />
      <Controls player={player} />
      <TimeInfo player={player} />
    </box>
  );
}
