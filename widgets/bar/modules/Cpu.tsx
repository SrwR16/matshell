import { bind } from "astal";
import Gsk from "gi://Gsk";
import { execAsync } from "astal/process";
import SystemMonitor from "utils/hwmonitor";
import { CircularProgressBar } from "widgets/common/circularprogress";

export default function Cpu() {
  const sysmon = SystemMonitor.get_default();

  return (
    <box cssClasses={["bar-hw-cpu-box"]}>
      <CircularProgressBar
        percentage={bind(sysmon, "cpuLoad")}
        radiusFilled={true}
        inverted={true}
        startAt={0.25}
        endAt={1.25}
        lineWidth={3.5}
        lineCap={Gsk.LineCap.ROUND}
      >
        <button
          cssClasses={["cpu-inner"]}
          onClicked={async () => {
            try {
              await execAsync("missioncenter");
            } catch (error) {
              console.error("Error:", error);
            }
          }}
          label="memory"
          //TODO Setting tooltips in or around circularprogress freezes all other tooltips
          // tooltipText={bind(sysmon, "cpuFrequency").as((f) => `${f} MHz`)}
        />
      </CircularProgressBar>
    </box>
  );
}
