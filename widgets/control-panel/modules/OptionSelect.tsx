import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import options from "options.ts";
import AstalComboBoxText from "./AstalComboBoxText.tsx";

export function OptionSelect({ option, label, choices = [] }) {
  return (
    <box cssClasses={["option-row", "option-select"]}>
      <label
        label={label}
        halign={Gtk.Align.START}
        hexpand={true}
        cssClasses={["option-label"]}
      />
      <AstalComboBoxText
        cssClasses={["option-dropdown"]}
        onChanged={(self) => {
          if (self.get_active_text() === undefined) {
            console.log("Got undefined!");
          } else if (self.get_active_text() !== undefined) {
            console.log(
              `Updating option ${option} to value: ${self.get_active_text()}`,
            );
            options[option].value = self.get_active_text();
          }
        }}
        active={bind(options[option]).as((val) => {
          // Handle undefined or missing values
          if (val === undefined) {
            console.log(
              `Option ${option} is undefined, defaulting to first choice`,
            );
            return 0; // Default to first item
          }

          const index = choices.indexOf(val);
          if (index === -1) {
            console.log(
              `Option ${option} value "${val}" not found in choices, defaulting to first choice`,
            );
            return 0; // Value not in choices, default to first item
          }

          return index;
        })}
      >
        {choices.map((choice) => ({ text: choice }))}
      </AstalComboBoxText>
    </box>
  );
}
