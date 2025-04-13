import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import Graphene from "gi://Graphene";

export function drawDots(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  const pathBuilder = new Gsk.PathBuilder();

  const horizontalSpacing = width / (bars - 1);

  // For scaling
  const aspectRatio = width / height;

  // Scale factor reduces as aspect ratio increases
  const scaleFactor = 0.4 / (1 + 0.1 * aspectRatio);

  // Dot size with minimum size protection
  const baseDotSize = horizontalSpacing * scaleFactor;

  // Cap maximum size relative to height
  const maxSize = height / 4;

  // Apply
  const dotSize = Math.max(4, Math.min(baseDotSize, maxSize));

  // Draw a dot for each value
  for (let i = 0; i < bars && i < values.length; i++) {
    const x = width * (i / (bars - 1));
    const y = height * (1 - values[i]);

    // Vary dot size with amplitude
    const amplifiedSize = dotSize * (0.8 + values[i] * 0.4);

    pathBuilder.add_circle(new Graphene.Point().init(x, y), amplifiedSize);
  }

  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);
}
