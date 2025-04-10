import { App, Astal } from "astal/gtk4";
import { bind } from "astal";
import Variable from "astal/variable";
import Hyprland from "gi://AstalHyprland";
import { hyprToGdk } from "utils/hyprland";
import OnScreenProgress from "./modules/Progress.tsx";

export default function OnScreenDisplay() {
  const visible = Variable(false);
  const hyprland = Hyprland.get_default();
  return (
    <window
      visible={visible()}
      name="osd"
      layer={Astal.Layer.OVERLAY}
      gdkmonitor={bind(hyprland, "focused-monitor").as(
        (focused: Hyprland.Monitor) => hyprToGdk(focused),
      )}
      anchor={Astal.WindowAnchor.BOTTOM}
      application={App}
      keymode={Astal.Keymode.ON_DEMAND}
      namespace="osd"
    >
      <OnScreenProgress visible={visible} />
    </window>
  );
}
