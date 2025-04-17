import { execAsync, bind } from "astal";
import { Gtk } from "astal/gtk4";
import { BluetoothItem } from "./BluetoothItem.tsx";
import Bluetooth from "gi://AstalBluetooth";
import { scanDevices, stopScan, isExpanded } from "utils/bluetooth.ts";

export const BluetoothDevices = () => {
  const bluetooth = Bluetooth.get_default();

  return (
    <box marginTop={4} vertical cssClasses={["network-list"]}>
      {bind(bluetooth, "devices").as((devices) => {
        const validDevices = devices.filter((device) => device.name != null);

        // Categorize devices
        const connectedDevices = validDevices.filter(
          (device) => device.connected,
        );
        const pairedDevices = validDevices.filter(
          (device) => device.paired && !device.connected,
        );
        const unparedDevices = validDevices.filter((device) => !device.paired);

        // Any known devices (connected or paired)
        const knownDevices = [...connectedDevices, ...pairedDevices];

        if (validDevices.length === 0) {
          return (
            <label label="No devices found" cssClasses={["empty-label"]} />
          );
        }

        return (
          <>
            {knownDevices.length > 0 ? (
              <>
                {/* Known Devices Section */}
                <label label="My Devices" cssClasses={["section-label"]} />
                {/* Connected devices first */}
                {connectedDevices.map((device) => (
                  <BluetoothItem device={device} />
                ))}
                {/* Then paired but not connected devices */}
                {pairedDevices.map((device) => (
                  <BluetoothItem device={device} />
                ))}
              </>
            ) : (
              ""
            )}

            {/* Available/Unpaired Devices Section */}
            {unparedDevices.length > 0 ? (
              <>
                <label
                  label="Available Devices"
                  cssClasses={["section-label"]}
                />
                {unparedDevices.map((device) => (
                  <BluetoothItem device={device} />
                ))}
              </>
            ) : (
              ""
            )}

            {/* Control buttons */}
            <box hexpand>
              <button
                halign={Gtk.Align.START}
                cssClasses={["refresh-button"]}
                onClicked={() => {
                  if (bluetooth.adapter.discovering) {
                    stopScan();
                  } else {
                    scanDevices();
                  }
                }}
              >
                <image
                  iconName={bind(bluetooth.adapter, "discovering").as(
                    (discovering) =>
                      discovering
                        ? "process-stop-symbolic"
                        : "view-refresh-symbolic",
                  )}
                />
              </button>

              <box hexpand />

              <button
                cssClasses={["settings-button"]}
                halign={Gtk.Align.END}
                hexpand={false}
                onClicked={() => {
                  execAsync("overskride");
                  isExpanded.set(false);
                }}
              >
                <image iconName={"emblem-system-symbolic"} />
              </button>
            </box>
          </>
        );
      })}
    </box>
  );
};
