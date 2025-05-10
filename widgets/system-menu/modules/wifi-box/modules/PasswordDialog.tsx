import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import {
  selectedNetwork,
  showPasswordDialog,
  passwordInput,
  connectToNetwork,
  errorMessage,
  isConnecting,
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
          onChanged={(entry) => passwordInput.set(entry.text)}
          onActivate={() =>
            connectToNetwork(selectedNetwork.get()?.ssid, passwordInput.get())
          }
        />
      </box>
      {errorMessage.get() && (
        <label label={errorMessage.get()} cssClasses={["error-message"]} />
      )}
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
