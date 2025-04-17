import { execAsync, bind } from "astal";
import Bluetooth from "gi://AstalBluetooth";
import { WiFiBox } from "./wifi-box/main.tsx";
import { BluetoothBox } from "./bluetooth-box/main.tsx";
import { getBluetoothIcon, getBluetoothText } from "utils/bluetooth.ts";

export const Toggles = () => {
  const bluetooth = Bluetooth.get_default();

  return (
    <box cssClasses={["toggles"]} vertical>
      <WiFiBox />
      {/* Bluetooth Toggle */}
      <BluetoothBox />
    </box>
  );
};
