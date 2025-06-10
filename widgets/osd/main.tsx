import { App, Astal } from "astal/gtk4";
import { bind } from "astal";
import Variable from "astal/variable";

import { getFocusedGdkMonitor } from "utils/niri.ts";
import OnScreenProgress from "./modules/Progress.tsx";
import options from "options.ts";

export default function OnScreenDisplay() {
  const { TOP, BOTTOM } = Astal.WindowAnchor;
  const visible = Variable(false);
  return (
    <window
      visible={visible()}
      name="osd"
      layer={Astal.Layer.OVERLAY}
      gdkmonitor={getFocusedGdkMonitor()}
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
