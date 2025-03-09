import { Gtk } from "astal/gtk3";
import { execAsync, bind } from "astal";
import Wp from "gi://AstalWp";
import Brightness from "../../../utils/brightness.ts";

export const Sliders = () => {
  const speaker = Wp.get_default()!.audio.defaultSpeaker;
  const brightness = Brightness.get_default();

  return (
    <box className="sliders" vertical>
      <box className="volume">
        <button onClick={() => execAsync("pwvucontrol")}>
          <icon icon={bind(speaker, "volumeIcon")} />
        </button>
        <slider
          value={bind(speaker, "volume")}
          onDragged={({ value }) => (speaker.volume = value)}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        />
      </box>
      <box className="brightness" visible={brightness.hasBacklight}>
        <icon icon="display-brightness-symbolic" />
        <slider
          value={bind(brightness, "screen")}
          onDragged={({ value }) => (brightness.screen = value)}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        />
      </box>
    </box>
  );
};
