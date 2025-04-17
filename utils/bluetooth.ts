import Bluetooth from "gi://AstalBluetooth";
import { Variable } from "astal";

export const isExpanded = Variable(false);
export const refreshIntervalId = Variable(null);
export const selectedDevice = Variable(null);
export const isConnecting = Variable(false);
export const errorMessage = Variable("");

export const getBluetoothIcon = (bt: Bluetooth.Bluetooth) => {
  if (!bt.is_powered) return "bluetooth-disabled-symbolic";
  if (bt.is_connected) return "bluetooth-active-symbolic";
  return "bluetooth-disconnected-symbolic";
};

export const getBluetoothText = (bt: Bluetooth.Bluetooth) => {
  if (!bt.is_powered) return "Bluetooth off";
  return "Bluetooth on";
};

export const getBluetoothDeviceText = (device) => {
  {
    let battery_str = "";
    if (device.connected && device.battery_percentage > 0) {
      battery_str = ` ${device.battery_percentage * 100}%`;
    }
    return `${device.name} ${battery_str}`;
  }
};

// Scanning functions
export const scanDevices = () => {
  const bluetooth = Bluetooth.get_default();
  if (bluetooth && bluetooth.adapter) {
    bluetooth.adapter.start_discovery();
  }
};

export const stopScan = () => {
  const bluetooth = Bluetooth.get_default();
  if (bluetooth && bluetooth.adapter) {
    bluetooth.adapter.stop_discovery();
  }
};

// Device interaction functions
export const connectToDevice = (device) => {
  if (!device) return;

  isConnecting.set(true);
  device.connect_device(() => {
    isConnecting.set(false);
    print("connected");
  });
};

export const disconnectDevice = (device) => {
  if (!device) return;

  device.disconnect_device(() => {
    print("disconnected");
  });
};

export const pairDevice = (device) => {
  if (!device) return;
  device.pair();
};

export const unpairDevice = (device) => {
  const bluetooth = Bluetooth.get_default();
  if (bluetooth && bluetooth.adapter) {
    bluetooth.adapter.remove_device(device);
  }
};

export const toggleTrust = (device) => {
  if (!device) return;
  device.set_trusted(!device.trusted);
};
