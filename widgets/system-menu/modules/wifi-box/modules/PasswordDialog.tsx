import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import {
  selectedNetwork,
  showPasswordDialog,
  passwordInput,
  connectToNetwork,
  errorMessage,
  isConnecting,
  scanTimer,
} from "utils/wifi.ts";

// Password dialog component
export const PasswordDialog = () => {
  return (
    <box vertical cssClasses={["password-dialog"]}>
      <label
        label={bind(selectedNetwork).as((sn) => (sn ? sn.ssid : ""))}
        cssClasses={["password-label"]}
      />
      <box cssClasses={["password-search"]}>
        <image iconName="network-wireless-encrypted-symbolic" />
        <entry
          placeholderText="Enter Password..."
          visibility={false}
          onChanged={(entry) => {
            passwordInput.set(entry.text);
            scanTimer.get()?.cancel();
            scanTimer.set(null);
          }}
          onActivate={() =>
            connectToNetwork(selectedNetwork.get()?.ssid, passwordInput.get())
          }
          onShow={() => {}}
        />
      </box>
      <box visible={bind(errorMessage).as((e) => e !== "")}>
        <label
          label={bind(errorMessage)}
          halign={Gtk.Align.CENTER}
          cssClasses={["error-message"]}
        />
      </box>
      <box>
        <button
          label={bind(isConnecting).as((c) =>
            c ? "Connecting..." : "Connect",
          )}
          cssClasses={["connect-button", "button"]}
          sensitive={!isConnecting.get()}
          onClicked={() =>
            connectToNetwork(selectedNetwork.get()?.ssid, passwordInput.get())
          }
        />
        <button
          label="Cancel"
          halign={Gtk.Align.END}
          hexpand
          cssClasses={["cancel-button", "button"]}
          onClicked={() => {
            showPasswordDialog.set(false);
            errorMessage.set("");
          }}
        />
      </box>
    </box>
  );
};
