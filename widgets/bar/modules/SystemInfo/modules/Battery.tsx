import { bind } from "astal";
import Battery from "gi://AstalBattery";

export default function Batt() {
  const battery = Battery.get_default();
  return (
    <icon
      className="battery module"
      visible={bind(battery, "is-battery")}
      icon={bind(battery, "battery-icon-name")}
      tooltipText={bind(battery, "percentage").as((p) => `Battery on ${Math.round(p * 100)}%`)}
    />
  );
}
