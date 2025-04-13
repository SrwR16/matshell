import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import { WaterfallState } from "./waterfall-base";

export function drawWaterfall(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
  state: WaterfallState,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  // Smooth transition
  const smoothedValues = [...values];
  if (state.historyFrames.length > 0) {
    const lastFrame = state.historyFrames[0];
    for (let i = 0; i < bars && i < values.length; i++) {
      // Apply exponential smoothing for more natural transitions
      smoothedValues[i] =
        state.transitionAlpha * values[i] +
        (1 - state.transitionAlpha) * lastFrame[i];
    }
  }

  // Add current frame to history
  state.historyFrames.unshift([...smoothedValues]);

  // Limit history size
  if (state.historyFrames.length > state.maxHistoryFrames) {
    state.historyFrames.pop();
  }

  const frameHeight = height / state.maxHistoryFrames;

  // Draw each frame in history
  for (let frame = 0; frame < state.historyFrames.length; frame++) {
    const frameValues = state.historyFrames[frame];
    const pathBuilder = new Gsk.PathBuilder();
    const frameY = frame * frameHeight;

    // Calculate opacity with a more gradual fade-out
    const opacity = 1 - Math.pow(frame / state.maxHistoryFrames, 1.2) * 0.9;

    // Draw a continuous curve instead of individual bars
    // Start at the left edge
    pathBuilder.move_to(
      0,
      frameY + frameHeight - frameHeight * 0.8 * frameValues[0],
    );

    // Determine how many points to render for smoother visualization
    // Using 3x number of actual data points for fine-grained interpolation
    const renderPoints = bars * 3;
    const barWidth = width / (renderPoints - 1);

    for (let i = 1; i < renderPoints; i++) {
      // Calculate the position in the actual data (can be fractional)
      const dataPos = (i / renderPoints) * (bars - 1);
      const dataIndex = Math.floor(dataPos);
      const fraction = dataPos - dataIndex;

      // Interpolate between data points for smoother curve
      let value;
      if (dataIndex >= bars - 1) {
        value = frameValues[bars - 1];
      } else {
        // Linear interpolation between neighboring values
        value =
          frameValues[dataIndex] * (1 - fraction) +
          frameValues[dataIndex + 1] * fraction;
      }

      const x = i * barWidth;
      const y = frameY + frameHeight - frameHeight * 0.85 * value;

      // Use cubic bezier curves for smoother lines
      if (i % 3 === 0) {
        // For actual data points, just use line_to
        pathBuilder.line_to(x, y);
      } else {
        // For interpolated points, create smooth curves
        const prevX = (i - 1) * barWidth;
        const prevY =
          frameY +
          frameHeight -
          frameHeight *
            0.85 *
            (frameValues[Math.floor((i - 1) / 3)] *
              (1 - ((i - 1) / 3 - Math.floor((i - 1) / 3))) +
              frameValues[Math.min(bars - 1, Math.ceil((i - 1) / 3))] *
                ((i - 1) / 3 - Math.floor((i - 1) / 3)));

        // Control points for smooth curve
        const ctrlX = (prevX + x) / 2;
        pathBuilder.quad_to(ctrlX, prevY, x, y);
      }
    }

    // Complete the shape by drawing to bottom corners
    pathBuilder.line_to(width, frameY + frameHeight);
    pathBuilder.line_to(0, frameY + frameHeight);
    pathBuilder.close();

    // Apply the color with frame-appropriate opacity
    const frameColor = color.copy();
    frameColor.alpha = opacity;
    snapshot.append_fill(
      pathBuilder.to_path(),
      Gsk.FillRule.WINDING,
      frameColor,
    );
  }

  widget.queue_draw();
}
