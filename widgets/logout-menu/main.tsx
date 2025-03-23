import { execAsync } from "astal/process";
import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { Variable } from "astal";

function hide() {
  App.get_window("logout-menu")!.hide();
}

function LogoutButton(label: String, command: String) {
  return (
    <button onClick={() => execAsync(["sh", "-c", command])} label={label}/>
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
        width.set(self.get_current_monitor().workarea.width);
      }}
      onKeyPressEvent={function (self, event: Gdk.Event) {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box className="logout-background">
        <eventbox widthRequest={width((w) => w / 2)} expand onClick={hide} />
        <box hexpand={false} vertical>
          <eventbox heightRequest={100} onClick={hide} />
          <box className="logout-menu" vertical>
            <box>
              {LogoutButton("lock", "hyprlock")}
              {LogoutButton("bedtime", "systemctl suspend || loginctl suspend")}
              {LogoutButton(
                "logout",
                "pkill Hyprland || loginctl terminate-user $USER",
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
          <eventbox expand onClick={hide} />
        </box>
          <eventbox widthRequest={width((w) => w / 2)} expand onClick={hide} />
      </box>
    </window>
  );
}
