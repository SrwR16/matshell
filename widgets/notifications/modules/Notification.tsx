import { bind } from "astal";
import { Gtk } from "astal/gtk4";
import Notifd from "gi://AstalNotifd";
import { NotificationIcon } from "./Icon.tsx";
import { time, urgency, createTimeoutManager } from "utils/notifd.ts";

// TODO There is still an issue with the hover handling on GTK4.
// The hover signal is apparently handled correctly by the timeoutManager,
// but the behavior is only as expected if the focused monitor changes 
// at least once before hovering the notification widget.
// This also happens without the focused monitor logic
// when not setting the gdkmonitor property.
// Causes?: 
// Visibility handling of upstream window? 
// Upstream bug? 

export function NotificationWidget({
  notification,
}: {
  notification: Notifd.Notification;
}) {
  const { START, CENTER, END } = Gtk.Align;
  const actions = notification.actions || [];
  const TIMEOUT_DELAY = 3000;

  // Keep track of notification validity
  const notifd = Notifd.get_default();
  const timeoutManager = createTimeoutManager(
    () => notification.dismiss(),
    TIMEOUT_DELAY,
  );
  return (
    <box
      setup={(self) => {
        // Set up timeout
        timeoutManager.setupTimeout();
        const clickGesture = Gtk.GestureClick.new();
        clickGesture.set_button(0); // 0 means any button
        clickGesture.connect("pressed", (gesture, n_press, x, y) => {
          try {
            // Get which button was pressed (1=left, 2=middle, 3=right)
            const button = gesture.get_current_button();

            if (button === 1) {
              // PRIMARY/LEFT
              if (actions.length > 0) n.invoke(actions[0]);
            } else if (button === 2) {
              // MIDDLE
              notifd.notifications?.forEach((n) => {
                n.dismiss();
              });
            } else if (button === 3) {
              // SECONDARY/RIGHT
              notification.dismiss();
            }
          } catch (error) {
            console.error(error);
          }
        });
        self.add_controller(clickGesture);

        self.connect("unrealize", () => {
          timeoutManager.cleanup();
        });
      }}
      onHoverEnter={timeoutManager.handleHover}
      onHoverLeave={timeoutManager.handleHoverLost}
      vertical
      vexpand={false}
      cssClasses={["notification", `${urgency(notification)}`]}
      name={notification.id.toString()}
    >
      <box cssClasses={["header"]}>
        <label
          cssClasses={["app-name"]}
          halign={CENTER}
          label={bind(notification, "app_name")}
        />
        <label
          cssClasses={["time"]}
          hexpand
          halign={END}
          label={time(notification.time)}
        />
      </box>
      <Gtk.Separator visible />
      <box cssClasses={["content"]}>
        <box
          cssClasses={["thumb"]}
          visible={Boolean(NotificationIcon(notification))}
          halign={CENTER}
          valign={CENTER}
          vexpand={true}
        >
          {NotificationIcon(notification)}
        </box>
        <box
          vertical
          cssClasses={["text-content"]}
          hexpand={true}
          halign={CENTER}
          valign={CENTER}
        >
          <label
            cssClasses={["title"]}
            valign={CENTER}
            wrap={false}
            label={bind(notification, "summary")}
          />
          {notification.body && (
            <label
              cssClasses={["body"]}
              valign={CENTER}
              wrap={true}
              maxWidthChars={50}
              label={bind(notification, "body")}
            />
          )}
        </box>
      </box>
      {actions.length > 0 && (
        <box cssClasses={["actions"]}>
          {actions.map((label, action) => (
            <button
              hexpand
              cssClasses={["action-button"]}
              onClicked={() => notification.invoke(action)}
            >
              <label label={label.toString()} halign={CENTER} hexpand />
            </button>
          ))}
        </box>
      )}
    </box>
  );
}
