import { App, Gtk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind } from "astal";
import { CavaDraw } from "widgets/music/modules/cava";
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
        type={"overlay measure"}
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
  return (
    <box>
      <box>
        <Cover player={player} />
      </box>
      <box>
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
    >
      {bind(mpris, "players").as(
        (players) => players[0] && <MusicBox player={players[0]} />,
      )}
    </button>
  );
}
