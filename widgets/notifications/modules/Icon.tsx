import { Gtk } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import { fileExists, isIcon } from "utils/notifd.ts";


export function NotificationIcon(notification: Notifd.Notification) {
  if ( notification.image || notification.appIcon || notification.desktopEntry) {
    const icon = notification.image || notification.appIcon || notification.desktopEntry;
    if (fileExists(icon)) {
      return (
        <box expand={false} valign={Gtk.Align.CENTER}>
          <image file={icon} />
        </box>
      );
    } else if (isIcon(icon)) {
      return (
        <box expand={false} valign={Gtk.Align.CENTER}>
          <image iconName={icon} />
        </box>
      );
    }
  }
  return null;
}

