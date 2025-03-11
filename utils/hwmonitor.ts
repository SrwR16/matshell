import GObject, { register, property } from "astal/gobject";
import { interval } from "astal/time";
import GTop from "gi://GTop";
import { readFile } from "astal/file";

@register({ GTypeName: "SystemMonitor" })
export default class SystemMonitor extends GObject.Object {
  static instance: SystemMonitor;
  private static readonly CPU_INFO_PATH = "/proc/cpuinfo";

  // Configuration
  private static readonly UPDATE_INTERVAL = 500;
  private static readonly BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"];

  // State tracking
  #memory = new GTop.glibtop_mem();
  #cpuLoad = 0;
  #lastUsed = 0;
  #lastTotal = 0;
  #cpuFreq = 0;

  static get_default(): SystemMonitor {
    return this.instance || (this.instance = new SystemMonitor());
  }

  constructor() {
    super();
    this.initializeBaseMetrics();
    this.startMonitoring();
  }

  private initializeBaseMetrics(): void {
    GTop.glibtop_get_mem(this.#memory);
    const initialCpu = new GTop.glibtop_cpu();
    GTop.glibtop_get_cpu(initialCpu);
    this.#lastUsed = this.calculateCpuUsed(initialCpu);
    this.#lastTotal = this.calculateCpuTotal(initialCpu);
  }

  private startMonitoring(): void {
    interval(SystemMonitor.UPDATE_INTERVAL, () => {
      this.updateCpuMetrics();
      this.updateCpuFrequency();
      this.updateMemoryMetrics();
      return true;
    });
  }

  private updateCpuMetrics(): void {
    const currentCpu = new GTop.glibtop_cpu();
    GTop.glibtop_get_cpu(currentCpu);

    const currentUsed = this.calculateCpuUsed(currentCpu);
    const currentTotal = this.calculateCpuTotal(currentCpu);
    const [diffUsed, diffTotal] = [
      currentUsed - this.#lastUsed,
      currentTotal - this.#lastTotal,
    ];

    this.#cpuLoad =
      diffTotal > 0 ? Math.min(1, Math.max(0, diffUsed / diffTotal)) : 0;
    this.#lastUsed = currentUsed;
    this.#lastTotal = currentTotal;

    this.notify("cpu-load");
  }

  private updateMemoryMetrics(): void {
    GTop.glibtop_get_mem(this.#memory);
    this.notify("memory-used");
    this.notify("memory-utilization");
  }

  private updateCpuFrequency(): void {
    try {
      const frequencies = this.parseCpuFrequencies();
      if (frequencies.length > 0) {
        this.#cpuFreq =
          frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        this.notify("cpu-frequency");
      }
    } catch (error) {
      console.error(`CPU frequency update failed: ${error}`);
    }
  }

  private parseCpuFrequencies(): number[] {
    return readFile(SystemMonitor.CPU_INFO_PATH)
      .split("\n")
      .filter((line) => line.includes("cpu MHz"))
      .map((line) => {
        const value = line.split(":")[1]?.trim();
        return value ? parseFloat(value) : NaN;
      })
      .filter((freq) => !isNaN(freq));
  }

  // Helper functions
  private calculateCpuUsed(cpu: GTop.glibtop_cpu): number {
    return cpu.user + cpu.sys + cpu.nice + cpu.irq + cpu.softirq;
  }

  private calculateCpuTotal(cpu: GTop.glibtop_cpu): number {
    return this.calculateCpuUsed(cpu) + cpu.idle + cpu.iowait;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, exp);
    return `${Math.round(value * 100) / 100} ${SystemMonitor.BYTE_UNITS[exp]}`;
  }

  // Property getters
  @property(Number)
  get memoryUtilization(): number {
    return this.#memory.user / this.#memory.total;
  }

  @property(String)
  get memoryUsed(): string {
    return this.formatBytes(this.#memory.user);
  }

  @property(Number)
  get cpuLoad(): number {
    return this.#cpuLoad;
  }

  @property(Number)
  get cpuFrequency(): number {
    return Math.round(this.#cpuFreq);
  }
}
