import { bind } from "astal";
import { execAsync } from "astal/process";
import SystemMonitor from "utils/hwmonitor";

export default function Mem() {
  const sysmon = SystemMonitor.get_default();

  return (
    <box className={"bar-hw-ram-box"}>
      <circularprogress
        className="ram"
        value={bind(sysmon, "memory-utilization")}
        startAt={0.25}
        endAt={1.25}
        rounded={false}
        tooltipText={bind(sysmon, "memory-used")}
      >
        <button
          className="ram-inner"
          onClick={async () => {
            try {
              await execAsync("missioncenter");
            } catch (error) {
              console.error("Error:", error);
            }
          }}
          label={"memory_alt"}
        ></button>
      </circularprogress>
    </box>
  );
}
