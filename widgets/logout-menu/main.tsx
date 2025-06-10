import { execAsync } from "astal/process";
import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import { Variable } from "astal";

function hide() {
  App.get_window("logout-menu")!.hide();
}

function LogoutButton(label: String, command: String) {
  return (
    <button onClicked={() => execAsync(["sh", "-c", command])} label={label} />
  );
}

export default function LogoutMenu() {
  const width = Variable(1000);
  const visible = Variable(false);

  return (
    <window
      name="logout-menu"
      visible={visible()}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      onShow={(self) => {
        width.set(self.get_current_monitor().geometry.width);
      }}
      onKeyPressed={(self, keyval) => {
        keyval === Gdk.KEY_Escape && self.hide();
      }}
    >
      <box cssClasses={["logout-background"]}>
        <button widthRequest={width((w) => w / 2)} expand onClicked={hide} />
        <box hexpand={false} vertical valign={Gtk.Align.CENTER}>
          <button onClicked={hide} />
          <box cssClasses={["logout-menu"]} vertical>
            <box>
              {LogoutButton("lock", "loginctl lock-session || swaylock")}
              {LogoutButton("bedtime", "systemctl suspend || loginctl suspend")}
              {LogoutButton(
                "logout",
                "loginctl terminate-user $USER",
              )}
            </box>
            <box>
              {LogoutButton(
                "power_settings_new",
                "systemctl poweroff || loginctl poweroff",
              )}
              {LogoutButton(
                "mode_standby",
                "systemctl hibernate || loginctl hibernate",
              )}
              {LogoutButton(
                "restart_alt",
                "systemctl reboot || loginctl reboot",
              )}
            </box>
          </box>
          <button expand onClicked={hide} />
        </box>
        <button widthRequest={width((w) => w / 2)} expand onClicked={hide} />
      </box>
    </window>
  );
}
