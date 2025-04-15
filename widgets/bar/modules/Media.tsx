import { App, Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { Variable, bind } from "astal";
import { CavaDraw, CavaStyle } from "widgets/music/modules/cava";
import options from "options.ts";

const mpris = Mpris.get_default();

function Cover({ player }) {
  return (
    <overlay>
      <box
        type={"overlay"}
        visible={bind(options["bar.modules.media.cava.show"])}
      >
        <CavaDraw
          vexpand
          hexpand
          style={bind(options["bar.modules.media.cava.style"])}
        />
      </box>
      <image
        type = {"overlay measure"}
        cssClasses={["cover"]}
        overflow={Gtk.Overflow.HIDDEN}
        file={bind(player, "coverArt")}
      />
    </overlay>
  );
}

function Title({ player }) {
  return (
    <label
      cssClasses={["title", "module"]}
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
      <box
        onHoverEnter={() => revealPower.set(true)}
        onHoverLeave={() => revealPower.set(false)}
      >
        <Title player={player} />
      </box>
    </box>
  );
}
``;

export default function Media() {
  return (
    <button
      cssClasses={["Media"]}
      onClicked={() => App.toggle_window("music-player")}
      visible={bind(mpris, "players").as((players) => players.length > 0)}
    >
      {bind(mpris, "players").as(
        (players) => players[0] && <MusicBox player={players[0]} />,
      )}
    </button>
  );
}
