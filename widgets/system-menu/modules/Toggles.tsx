import { execAsync, bind } from "astal";
import Bluetooth from "gi://AstalBluetooth";
import { WiFiBox } from "./wifi-box/main.tsx";
import { getBluetoothIcon, getBluetoothText } from "utils/bluetooth.ts";

export const Toggles = () => {
  const bluetooth = Bluetooth.get_default();

  return (
    <box cssClasses={["toggles"]} vertical>
      <WiFiBox />
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
