import Battery from "gi://AstalBattery";

export const toTime = (time: number) => {
  const MINUTE = 60;
  const HOUR = MINUTE * 60;

  if (time > 24 * HOUR) return "";

  const hours = Math.round(time / HOUR);
  const minutes = Math.round((time - hours * HOUR) / MINUTE);

  const hoursDisplay = hours > 0 ? `${hours}h ` : "";
  const minutesDisplay = minutes > 0 ? `${minutes}m ` : "";

  return `${hoursDisplay}${minutesDisplay}`;
};

export const batteryTime = (batt: Battery.Device) => {
  return batt.time_to_empty > 0 && toTime(batt.time_to_empty) != ""
    ? `${toTime(batt.time_to_empty)}remaining`
    : "";
};
