import { bind } from "astal";
import { execAsync } from "astal/process";
import SystemMonitor from "utils/hwmonitor";

export default function Cpu() {
  const sysmon = SystemMonitor.get_default();

  return (
    <box className={"bar-hw-cpu-box"}>
      <circularprogress
        className="cpu"
        value={bind(sysmon, "cpuLoad")}
        startAt={0.25}
        endAt={1.25}
        rounded={false}
        tooltipText={bind(sysmon, "cpuFrequency").as((f) => `${f} MHz`)}
      >
        <button
          className="cpu-inner"
          onClick={async () => {
            try {
              await execAsync("missioncenter");
            } catch (error) {
              console.error("Error:", error);
            }
          }}
          label="memory"
        />
      </circularprogress>
    </box>
  );
}
