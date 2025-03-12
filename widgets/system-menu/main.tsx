import { Astal, App } from "astal/gtk3";
import PowerProfiles from "gi://AstalPowerProfiles";
import { Variable } from "astal";
import { Sliders } from "./modules/Sliders.tsx";
import { Toggles } from "./modules/Toggles.tsx";
import { PowerBox } from "./modules/PowerBox.tsx";

export default function SystemMenu() {
  const powerprofiles = PowerProfiles.get_default();
  const hasProfiles = powerprofiles?.get_profiles()?.length > 0;
  const { TOP, RIGHT } = Astal.WindowAnchor;
  const visible = Variable(false);
  return (
    <window
      name="system-menu"
      application={App}
      layer={Astal.Layer.OVERLAY}
      anchor={TOP | RIGHT}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={visible()}
    >
      <box className="system-menu" vertical>
        <Toggles />
        {hasProfiles && <PowerBox />}
        <Sliders />
      </box>
    </window>
  );
}
