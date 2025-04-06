import Net from "./modules/Net.tsx";
import Blue from "./modules/Bluetooth.tsx";
import Batt from "./modules/Battery.tsx"
import { App } from "astal/gtk4";

export default function SystemInfo() {
  return (
    <button
      cssClasses={["system-menu-toggler"]}
      onClicked={() => App.toggle_window("system-menu")}
    >
      <box>
        <Net />
        <Blue />
        <Batt />
      </box>
    </button>
  );
}
