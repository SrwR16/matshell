import { execAsync, bind } from "astal";
import Bluetooth from "gi://AstalBluetooth";
import Network from "gi://AstalNetwork";
import {
  getBluetoothIcon,
  getBluetoothText,
} from "utils/bluetooth.ts";

export const Toggles = () => {
  const network = Network.get_default();
  const bluetooth = Bluetooth.get_default();

  return (
    <box cssClasses={["toggles"]} vertical>
      {/* Network Toggle */}
      <box cssClasses={["toggle"]}>
        <button
          onClicked={() => {
            if (network.wifi.enabled) {
              network.wifi.set_enabled(false);
            } else network.wifi.set_enabled(true);
          }}
          cssClasses={bind(network, "connectivity").as((c) =>
            c === Network.Connectivity.FULL ? ["button"] : ["button-disabled"],
          )}
        >
          <image iconName={bind(network.wifi, "icon_name")} />
        </button>
        <button
          onClicked={() =>
            execAsync([
              "sh",
              "-c",
              "XDG_CURRENT_DESKTOP=GNOME gnome-control-center",
            ])
          }
        >
          <label label={bind(network.wifi, "ssid")} />
        </button>
      </box>

      {/* Bluetooth Toggle */}
      <box cssClasses={["toggle"]}>
        <button
          onClicked={() => bluetooth.toggle()}
          cssClasses={bind(bluetooth, "is_powered").as((p) =>
            p ? ["button"] : ["button-disabled"],
          )}
        >
          <image
            iconName={bind(bluetooth, "devices").as(() =>
              getBluetoothIcon(bluetooth),
            )}
          />
        </button>
        <button onClicked={() => execAsync("overskride")}>
          <label
            label={bind(bluetooth, "devices").as(
              (devices) => getBluetoothText(devices, bluetooth) || "Bluetooth",
            )}
          />
        </button>
      </box>
    </box>
  );
};
