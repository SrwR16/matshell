import { Astal } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import Hyprland from "gi://AstalHyprland";
import { bind } from "astal";
import { hyprToGdk } from "utils/hyprland.ts";
import { NotificationWidget } from "./modules/Notification.tsx";

export default function Notifications() {
  const notifd = Notifd.get_default();
  const hyprland = Hyprland.get_default();
  const { TOP, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      name="notifications"
      gdkmonitor={bind(hyprland, "focused-monitor").as(
        (focused: Hyprland.Monitor) => hyprToGdk(focused),
      )}
      anchor={TOP | RIGHT}
      visible={bind(notifd, "notifications").as(
        (notifications) => notifications.length > 0,
      )}
      child={
        <box vertical={true} cssClasses={["notifications"]}>
          {bind(notifd, "notifications").as((notifications) =>
            notifications.map((n) => <NotificationWidget notification={n} />),
          )}
        </box>
      }
    />
  );
}
