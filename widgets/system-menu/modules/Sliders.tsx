import { Gtk } from "astal/gtk4";
import { execAsync, bind } from "astal";
import Wp from "gi://AstalWp";
import Brightness from "utils/brightness.ts";

export const Sliders = () => {
  const speaker = Wp.get_default()!.audio.defaultSpeaker;
  const brightness = Brightness.get_default();

  return (
    <box cssClasses={["sliders"]} vertical>
      <box cssClasses={["volume"]}>
        <button onClicked={() => execAsync("pwvucontrol")}>
          <image iconName={bind(speaker, "volumeIcon")} />
        </button>
        <slider
          onChangeValue={(self) => {
            speaker.volume = self.value;
          }}
          value={bind(speaker, "volume")}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        />
      </box>
      <box cssClasses={["brightness"]} visible={brightness.hasBacklight}>
        <image iconName="display-brightness-symbolic" />
        <slider
          value={bind(brightness, "screen")}
          onChangeValue={(self) => {
            brightness.screen = self.value;
          }}
          min={0.1}
          valign={Gtk.Align.CENTER}
          hexpand={true}
        />
      </box>
    </box>
  );
};
