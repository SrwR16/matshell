import { App, Gtk } from "astal/gtk3";
import Mpris from "gi://AstalMpris";
import { Variable, bind } from "astal";
import { Controls } from "widgets/music/modules/Controls";

const mpris = Mpris.get_default();

function Cover({ player }) {
  return (
    <box
      className="cover"
      css={bind(player, "coverArt").as(
        (cover) => `background-image: url('${cover}');`,
      )}
    />
  );
}

function Title({ player }) {
  return (
    <label
      className="title module"
      label={bind(player, "metadata").as(
        () => player.title && `${player.artist} - ${player.title}`,
      )}
    />
  );
}

function MusicBox({ player }) {
  const revealPower = Variable(false);
  return (
    <box>
      <box>
        <Cover player={player} />
      </box>
      <eventbox
        onHover={() => revealPower.set(true)}
        onHoverLost={() => revealPower.set(false)}
      >
        <box>
          <Title player={player} />
          <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            transitionDuration={300}
            revealChild={bind(revealPower)}
          >
            <Controls player={player} widthRequest={80} />
          </revealer>
        </box>
      </eventbox>
    </box>
  );
}
``

export default function Media() {

  return (
    <eventbox
      className="Media"
      onClick={() => App.toggle_window("music-player")}
      visible={bind(mpris, "players").as((players) => players.length > 0)}
    >
      {bind(mpris, "players").as(
        (players) => players[0] && <MusicBox player={players[0]} />,
      )}
    </eventbox>
  );
}
