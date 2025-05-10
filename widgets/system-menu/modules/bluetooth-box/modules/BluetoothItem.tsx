import { bind, Variable } from "astal";
import { Gtk, App } from "astal/gtk4";
import Pango from "gi://Pango";
import {
  connectToDevice,
  disconnectDevice,
  pairDevice,
  unpairDevice,
  toggleTrust,
  isExpanded,
  getBluetoothDeviceText,
} from "utils/bluetooth.ts";

// Device Item component
export const BluetoothItem = ({ device }) => {
  const itemButtonsRevealed = Variable(false);
  const connectionButtonIcon = Variable.derive(
    [bind(device, "connected"), bind(device, "connecting")],
    (connected, connecting) => {
      if (connected) return "bluetooth-active-symbolic";
      else if (connecting) return "bluetooth-acquiring-symbolic";
      else return "bluetooth-disconnected-symbolic";
    },
  );

  return (
    <box vertical={true} cssClasses={["bt-device-item"]}>
      <button
        hexpand={true}
        cssClasses={bind(device, "connected").as((connected) =>
          connected
            ? ["network-item", "network-item-connected"]
            : ["network-item", "network-item-disconnected"],
        )}
        onClicked={() => {
          itemButtonsRevealed.set(!itemButtonsRevealed.get());
        }}
        onDestroy={() => {
          connectionButtonIcon.drop();
        }}
      >
        <label
          halign={Gtk.Align.START}
          maxWidthChars={24}
          ellipsize={Pango.EllipsizeMode.END}
          label={getBluetoothDeviceText(device)}
        />
      </button>
      <revealer
        setup={() => {
          bind(isExpanded).as((parentExpanded) => {
            // Close revealer if parent revealer is closed
            // Super cheap fix until the revealer bug is fixed
            // https://github.com/Aylur/astal/issues/258
            //itemButtonsRevealed.set(false); // use this instead when fixed
            !parentExpanded &&
              (App.toggle_window("system-menu"),
              App.toggle_window("system-menu"));
          });
          const windowListener = App.connect("window-toggled", (_, window) => {
            window.name == "system-menu" &&
              itemButtonsRevealed.get() &&
              itemButtonsRevealed.set(false);

            !isExpanded && itemButtonsRevealed.set(false);
          });

          return () => {
            // Clean up the listener when component is destroyed
            App.disconnect(windowListener);
          };
        }}
        revealChild={itemButtonsRevealed()}
        transitionDuration={200}
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      >
        <box
          vertical={false}
          cssClasses={["bt-button-container"]}
          homogeneous={true}
        >
          <button
            hexpand={true}
            cssClasses={bind(device, "connected").as((connected) =>
              connected
                ? ["button", "connect-button"]
                : ["button-disabled", "connect-button"],
            )}
            visible={bind(device, "paired")}
            onClicked={() => {
              !device.connecting &&
                (device.connected
                  ? disconnectDevice(device)
                  : connectToDevice(device));
            }}
            tooltipText={bind(device, "connected").as((paired) =>
              paired ? "Disconnect" : "Connect",
            )}
          >
            <image iconName={connectionButtonIcon()} />
          </button>
          <button
            hexpand={true}
            cssClasses={bind(device, "trusted").as((trusted) =>
              trusted
                ? ["button", "trust-button"]
                : ["button-disabled", "trust-button"],
            )}
            visible={bind(device, "paired")}
            onClicked={() => toggleTrust(device)}
            tooltipText={bind(device, "trusted").as((paired) =>
              paired ? "Untrust" : "Trust",
            )}
          >
            <image
              iconName={bind(device, "trusted").as((trusted) =>
                trusted ? "security-high-symbolic" : "security-low-symbolic",
              )}
            />
          </button>
          <button
            hexpand={true}
            cssClasses={bind(device, "paired").as((paired) =>
              paired
                ? ["button", "pair-button"]
                : ["button-disabled", "pair-button"],
            )}
            onClicked={() => {
              device.paired ? unpairDevice(device) : pairDevice(device);
            }}
            tooltipText={bind(device, "paired").as((paired) =>
              paired ? "Unpair" : "Pair",
            )}
          >
            <image
              iconName={bind(device, "paired").as((paired) =>
                paired
                  ? "network-transmit-receive-symbolic"
                  : "network-offline-symbolic",
              )}
            />
          </button>
        </box>
      </revealer>
    </box>
  );
};
