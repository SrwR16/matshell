import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import options from "options.ts";

export function OptionToggle({ option, label, icon = null }) {
  return (
    <box cssClasses={["option-row", "option-toggle"]}>
      {icon && <image iconName={icon} cssClasses={["option-icon"]} />}
      <label
        label={label}
        halign={Gtk.Align.START}
        hexpand={true}
        cssClasses={["option-label"]}
      />
      <switch
        cssClasses={["option-switch"]}
        active={bind(options[option])}
        onNotifyActive={(self) => {
          console.log(`Toggle ${option} changed to: ${self.active}`);
          options[option].value = self.active;
        }}
      />
    </box>
  );
}
