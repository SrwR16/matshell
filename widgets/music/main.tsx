import { App, Astal } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { bind, Variable, Gio } from "astal";
import { findPlayer, generateBackground } from "utils/mpris";
import { Cover } from "./modules/Cover";
import { Info } from "./modules/Info";
import { CavaDraw } from "./modules/cava";
import { astalify, Gtk } from "astal/gtk4";
import options from "options.ts";

const Picture = astalify<Gtk.Picture, Gtk.Picture.ConstructorProps>(
  Gtk.Picture,
);

function MusicBox({ player }: { player: Mpris.Player }) {
  return (
    <overlay>
      <Gtk.ScrolledWindow>
        <Picture
          cssClasses={["blurred-cover"]}
          file={bind(player, "cover_art").as((c) =>
            Gio.file_new_for_path(generateBackground(c)),
          )}
          contentFit={Gtk.ContentFit.COVER}
        />
      </Gtk.ScrolledWindow>
      <box
        cssClasses={["cava-container"]}
        type="overlay clip"
        visible={bind(options["musicPlayer.modules.cava.show"])}
      >
        <CavaDraw
          hexpand
          vexpand
          style={bind(options["musicPlayer.modules.cava.style"])}
        />
      </box>
      <box type="overlay measure">
        <Cover player={player} />
        <Info player={player} />
      </box>
    </overlay>
  );
}

export default function MusicPlayer() {
  const mpris = Mpris.get_default();
  const { TOP } = Astal.WindowAnchor;
  const visible = Variable(false);
  return (
    <window
      name="music-player"
      cssClasses={["music", "window"]}
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={TOP}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={visible()}
    >
      <box>
        {bind(mpris, "players").as((players) =>
          players.length > 0 ? <MusicBox player={findPlayer(players)} /> : null,
        )}
      </box>
    </window>
  );
}
