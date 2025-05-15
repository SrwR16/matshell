import { App, Astal } from "astal/gtk4";
import { bind } from "astal";
import Variable from "astal/variable";
import Hyprland from "gi://AstalHyprland";

import { hyprToGdk } from "utils/hyprland";
import OnScreenProgress from "./modules/Progress.tsx";
import options from "options.ts";

export default function OnScreenDisplay() {
  const { TOP, BOTTOM } = Astal.WindowAnchor;
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
      anchor={bind(options["bar.position"]).as((pos) => {
        switch (pos) {
          case "top":
            return BOTTOM;
          case "bottom":
            return TOP;
          default:
            return BOTTOM;
        }
      })}
      application={App}
      keymode={Astal.Keymode.ON_DEMAND}
      namespace="osd"
    >
      <OnScreenProgress visible={visible} />
    </window>
  );
}
