// Credits to https://github.com/kotontrion/kompass

import { Gtk, Gdk } from "astal/gtk4";
import Cava from "gi://AstalCava";
import GObject from "gi://GObject";
import Gsk from "gi://Gsk";

export enum CavaStyle {
  SMOOTH = 0,
  CATMULL_ROM = 1,
}

const CavaWidget = GObject.registerClass(
  {
    CssName: "cava", // Set CSS name for the widget
    Properties: {
      style: GObject.ParamSpec.int(
        "style",
        "Style",
        "Visualization style",
        GObject.ParamFlags.READWRITE,
        CavaStyle.SMOOTH,
        CavaStyle.CATMULL_ROM,
        CavaStyle.CATMULL_ROM,
      ),
    },
  },
  class CavaWidget extends Gtk.Widget {
    public cava = Cava.get_default()!;
    private _style: CavaStyle = CavaStyle.CATMULL_ROM;

    constructor() {
      super();
      this.cava.connect("notify::values", () => {
        this.queue_draw();
      });
    }

    // For style property (get/set)
    get style(): CavaStyle {
      return this._style;
    }

    set style(val: CavaStyle) {
      this._style = val;
      this.queue_draw();
    }

    // Get the color from the widget's style context
    private get_color(): Gdk.RGBA {
      const rgba = new Gdk.RGBA();
      rgba.parse("#a6da95"); // Default fallback color

      const styleContext = this.get_style_context();
      if (styleContext) {
        return styleContext.get_color();
      }

      return rgba;
    }

    vfunc_snapshot(snapshot: Gtk.Snapshot) {
      super.vfunc_snapshot(snapshot);

      // Choose drawing style based on the style property
      if (this.style === CavaStyle.SMOOTH) {
        this.draw_smooth(snapshot);
      } else {
        this.draw_catmull_rom(snapshot);
      }
    }

    private draw_catmull_rom(snapshot: Gtk.Snapshot) {
      const width = this.get_width();
      const height = this.get_height();
      const color = this.get_color();

      const values = this.cava.get_values();
      const bars = this.cava.get_bars();

      if (bars === 0 || values.length === 0) return;

      // Create path builder
      const pathBuilder = new Gsk.PathBuilder();

      // Start drawing the Catmull-Rom spline curve
      pathBuilder.move_to(0, height - height * values[0]);

      const barWidth = width / (bars - 1);

      for (let i = 0; i <= bars - 2 && i + 1 < values.length; i++) {
        let p0, p1, p2, p3;

        // Set up the four points needed for Catmull-Rom spline
        if (i === 0) {
          p0 = { x: i * barWidth, y: height - height * values[i] };
          p3 = {
            x: (i + 2) * barWidth,
            y: height - height * values[Math.min(i + 2, values.length - 1)],
          };
        } else if (i === bars - 2) {
          p0 = { x: (i - 1) * barWidth, y: height - height * values[i - 1] };
          p3 = { x: (i + 1) * barWidth, y: height - height * values[i + 1] };
        } else {
          p0 = { x: (i - 1) * barWidth, y: height - height * values[i - 1] };
          p3 = {
            x: (i + 2) * barWidth,
            y: height - height * values[Math.min(i + 2, values.length - 1)],
          };
        }

        p1 = { x: i * barWidth, y: height - height * values[i] };
        p2 = { x: (i + 1) * barWidth, y: height - height * values[i + 1] };

        // Calculate control points for the cubic Bezier curve
        const c1 = {
          x: p1.x + (p2.x - p0.x) / 6,
          y: p1.y + (p2.y - p0.y) / 6,
        };
        const c2 = {
          x: p2.x - (p3.x - p1.x) / 6,
          y: p2.y - (p3.y - p1.y) / 6,
        };

        // Add the cubic Bezier curve to path
        pathBuilder.cubic_to(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
      }

      // Complete the path by drawing lines to the bottom corners
      pathBuilder.line_to(width, height);
      pathBuilder.line_to(0, height);
      pathBuilder.close();

      // Fill the path with the color
      snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);
    }

    private draw_smooth(snapshot: Gtk.Snapshot) {
      const width = this.get_width();
      const height = this.get_height();
      const color = this.get_color();

      const values = this.cava.get_values();
      const bars = this.cava.get_bars();

      if (bars === 0 || values.length === 0) return;

      const pathBuilder = new Gsk.PathBuilder();
      let lastX = 0;
      let lastY = height - height * values[0];
      const barWidth = width / (bars - 1);

      pathBuilder.move_to(lastX, lastY);

      for (let i = 1; i < bars && i < values.length; i++) {
        const h = height * values[i];
        const y = height - h;

        pathBuilder.cubic_to(
          lastX + barWidth / 2,
          lastY,
          lastX + barWidth / 2,
          y,
          i * barWidth,
          y,
        );

        lastX = i * barWidth;
        lastY = y;
      }

      // Close the path by drawing lines to the bottom
      pathBuilder.line_to(lastX, height);
      pathBuilder.line_to(0, height);
      pathBuilder.close();

      // Fill the path with the color
      snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);
    }
  },
);

export function CavaDraw(props: {
  style?: CavaStyle | { subscribe: Function; get: Function };
  hexpand?: boolean;
  vexpand?: boolean;
}) {
  const cavaWidget = new CavaWidget();

  if (props.hexpand !== undefined) {
    cavaWidget.set_hexpand(props.hexpand);
  } else {
    cavaWidget.set_hexpand(false);
  }

  if (props.vexpand !== undefined) {
    cavaWidget.set_vexpand(props.vexpand);
  } else {
    cavaWidget.set_vexpand(false);
  }

  // Handle style binding
  if (props.style !== undefined) {
    if (
      typeof props.style === "object" &&
      "subscribe" in props.style &&
      "get" in props.style
    ) {
      cavaWidget.style = props.style.get();

      props.style.subscribe((value) => {
        cavaWidget.style = value;
      });
    } else {
      cavaWidget.style = props.style as CavaStyle;
    }
  }
  return cavaWidget;
}
