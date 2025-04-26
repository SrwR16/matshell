import { bind } from "astal";
import { WiFiBox } from "./wifi-box/main.tsx";
import { BluetoothBox } from "./bluetooth-box/main.tsx";
import Bluetooth from "gi://AstalBluetooth";
import Network from "gi://AstalNetwork";

export const Toggles = () => {
  const bluetooth = Bluetooth.get_default();
  const network = Network.get_default();

  return (
    <box cssClasses={["toggles"]} vertical>
      {/* WiFi Box */}
      <box
        visible={bind(network, "primary").as((p) => p === Network.Primary.WIFI)}
      >
        <WiFiBox />
      </box>
      {/* Bluetooth Box */}
      <box visible={bind(bluetooth, "adapter")}>
        <BluetoothBox />
      </box>
    </box>
  );
};
