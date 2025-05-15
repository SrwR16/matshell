import { Astal, App } from "astal/gtk4";
import PowerProfiles from "gi://AstalPowerProfiles";
import { Variable, bind } from "astal";
import { Sliders } from "./modules/Sliders.tsx";
import { Toggles } from "./modules/Toggles.tsx";
import { PowerProfileBox } from "./modules/PowerProfileBox.tsx";
import { BatteryBox } from "./modules/BatteryBox.tsx";
import options from "options.ts";

export default function SystemMenu() {
  const powerprofiles = PowerProfiles.get_default();
  const hasProfiles = powerprofiles?.get_profiles()?.length > 0;
  const { TOP, BOTTOM, RIGHT } = Astal.WindowAnchor;
  const visible = Variable(false);
  return (
    <window
      name="system-menu"
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={bind(options["bar.position"]).as((pos) => {
        switch (pos) {
          case "top":
            return TOP | RIGHT;
          case "bottom":
            return BOTTOM | RIGHT;
          default:
            return TOP | RIGHT;
        }
      })}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={visible()}
    >
      <box cssClasses={["system-menu"]} widthRequest={285} vertical>
        <Toggles />
        {hasProfiles && <PowerProfileBox />}
        <Sliders />
        <BatteryBox />
      </box>
    </window>
  );
}
