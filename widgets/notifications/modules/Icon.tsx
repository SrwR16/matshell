import { Gtk } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import { fileExists, isIcon } from "utils/notifd.ts";

export function NotificationIcon(notification: Notifd.Notification) {
  if (notification.appIcon && fileExists(notification.appIcon)) {
    return (
      <box expand={false} valign={Gtk.Align.CENTER}>
        <image file={notification.appIcon} />
      </box>
    );
  }
  if (notification.image && isIcon(notification.image)) {
    return (
      <box expand={false} valign={Gtk.Align.CENTER}>
        <image iconName={notification.image} />
      </box>
    );
  }
  return null;
}
