import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import { GLib } from "astal";
import Graphene from "gi://Graphene";
import { JumpingBarsState } from "./jumping-bars-base";

export function drawJumpingBars(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
  state: JumpingBarsState,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  const now = GLib.get_monotonic_time() / 1000000;
  const deltaTime = state.lastUpdate === 0 ? 0.016 : now - state.lastUpdate;
  state.lastUpdate = now;

  // Initialize arrays if needed
  if (state.barHeights.length !== bars) {
    state.barHeights = new Array(bars).fill(0);
    state.barVelocities = new Array(bars).fill(0);
  }

  const spacing = 3;
  const barWidth = (width - spacing * (bars - 1)) / bars;
  const pathBuilder = new Gsk.PathBuilder();

  // Update and draw each bar
  for (let i = 0; i < bars && i < values.length; i++) {
    const targetHeight = values[i] * height;

    // Jump up when audio increases
    if (targetHeight > state.barHeights[i]) {
      state.barVelocities[i] = Math.max(
        state.barVelocities[i],
        (targetHeight - state.barHeights[i]) * 5,
      );
    }

    // Update position with velocity
    state.barHeights[i] += state.barVelocities[i] * deltaTime;

    // Apply gravity
    state.barVelocities[i] -= 900 * deltaTime;

    // Floor constraint
    if (state.barHeights[i] < 0) {
      state.barHeights[i] = 0;
      state.barVelocities[i] = 0;
    }

    // Ceiling constraint with bounce
    if (state.barHeights[i] > height) {
      state.barHeights[i] = height;
      state.barVelocities[i] *= -0.5; // Bounce with damping
    }

    // Draw the bar
    const x = i * (barWidth + spacing);
    pathBuilder.add_rect(
      new Graphene.Rect().init(
        x,
        height - state.barHeights[i],
        barWidth,
        state.barHeights[i],
      ),
    );
  }

  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);

  widget.queue_draw();
}
