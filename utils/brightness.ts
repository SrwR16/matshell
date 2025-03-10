import GObject, { register, property } from "astal/gobject";
import { monitorFile, readFileAsync } from "astal/file";
import { exec, execAsync } from "astal/process";

const get = (args: string) => Number(exec(`brightnessctl ${args}`));
const screen = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`);
const kbd = exec(`bash -c "ls -w1 /sys/class/leds | head -1"`);

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
  static instance: Brightness;
  static get_default() {
    if (!this.instance) this.instance = new Brightness();
    return this.instance;
  }

  #hasBacklight = false;
  #kbdMax = 0;
  #kbd = 0;
  #screenMax = 0;
  #screen = 0;
  #screenDev = "";
  #kbdDev = "";

  constructor() {
    super();

    this.#hasBacklight =
      exec(`bash -c "ls /sys/class/backlight"`).length > 0;

    // Do not initialize without backlight, use on notebooks only.
    if (!this.#hasBacklight) return;

    // Initialize values
    this.#kbdMax = get(`--device ${kbd} max`);
    this.#kbd = get(`--device ${kbd} get`);
    this.#screenMax = get("max");
    this.#screen = get("get") / (get("max") || 1);

    // Setup file monitoring
    monitorFile(
      `/sys/class/backlight/${screen}/brightness`,
      async (f) => {
        const v = await readFileAsync(f);
        this.#screen = Number(v) / this.#screenMax;
        this.notify("screen");
      },
    );

    monitorFile(`/sys/class/leds/${kbd}/brightness`, async (f) => {
      const v = await readFileAsync(f);
      this.#kbd = Number(v);
      this.notify("kbd");
    });
  }
  @property(Boolean)
  get hasBacklight() {
    return this.#hasBacklight;
  }

  @property(Number)
  get kbd() {
    return this.#kbd;
  }

  set kbd(value) {
    if (value < 0 || value > this.#kbdMax) return;
    execAsync(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
      this.#kbd = value;
      this.notify("kbd");
    });
  }

  @property(Number)
  get screen() {
    return this.#screen;
  }

  set screen(percent) {
    percent = Math.max(0, Math.min(1, percent));
    execAsync(
      `brightnessctl -d ${screen} set ${Math.floor(percent * 100)}% -q`,
    ).then(() => {
      this.#screen = percent;
      this.notify("screen");
    });
  }
}
