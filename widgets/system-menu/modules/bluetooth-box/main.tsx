import { bind } from "astal";
import { App, Gtk } from "astal/gtk4";
import Bluetooth from "gi://AstalBluetooth";
import { BluetoothDevices } from "./modules/BluetoothDevices.tsx";
import {
  getBluetoothIcon,
  getBluetoothText,
  scanDevices,
  isExpanded,
} from "utils/bluetooth.ts";

// Main Bluetooth Box component
export const BluetoothBox = () => {
  const bluetooth = Bluetooth.get_default();

  return (
    <box cssClasses={["toggle"]} vertical={true}>
      {/* Bluetooth Toggle Header */}
      <box>
        <button
          onClicked={() => {
            bluetooth.toggle();
          }}
          cssClasses={bind(bluetooth, "is_powered").as((powered) =>
            powered ? ["button"] : ["button-disabled"],
          )}
        >
          <image
            iconName={bind(bluetooth, "devices").as(() =>
              getBluetoothIcon(bluetooth),
            )}
          />
        </button>
        <button
          hexpand={true}
          onClicked={() => {
            if (bluetooth.is_powered) {
              isExpanded.set(!isExpanded.get());
            }
          }}
        >
          <box hexpand={true}>
            <label
              xalign={0}
              hexpand={true}
              label={getBluetoothText(bluetooth) || "Bluetooth"}
            />
            <image
              iconName="pan-end-symbolic"
              halign={Gtk.Align.END}
              cssClasses={bind(isExpanded).as((expanded) =>
                expanded
                  ? ["arrow-indicator", "arrow-down"]
                  : ["arrow-indicator"],
              )}
            />
          </box>
        </button>
      </box>

      {/* Devices List Revealer */}
      <revealer
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={250}
        revealChild={bind(isExpanded)}
        setup={() => {
          const windowListener = App.connect("window-toggled", (_, window) => {
            window.name === "system-menu" &&
              isExpanded.get() &&
              isExpanded.set(false);
          });
          bind(isExpanded).subscribe((expanded) => {
            const bluetoothPowered = bluetooth.is_powered;
            const isDiscovering = bluetooth.adapter.discovering;

            if (expanded && bluetoothPowered && !isDiscovering) {
              // Start scanning when expanded and not already discovering
              scanDevices();
            } else if (!expanded) {
              // When not expanded, always apply the revealer bug fix

              // Super cheap fix until the revealer bug is fixed
              // https://github.com/Aylur/astal/issues/258
              App.toggle_window("system-menu");
              App.toggle_window("system-menu");
            }
          });

          return () => {
            // Clean up the listener when component is destroyed
            App.disconnect(windowListener);
            bind(isExpanded).unsubscribe();
          };
        }}
      >
        {/* Bluetooth Devices */}
        <BluetoothDevices />
      </revealer>
    </box>
  );
};

export default BluetoothBox;
