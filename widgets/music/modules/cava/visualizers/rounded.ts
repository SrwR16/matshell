import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import Graphene from "gi://Graphene";

export function drawRounded(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  // Create a rounded rectangle for clipping
  const fullRect = new Graphene.Rect();
  fullRect.init(0, 0, width, height);
  const roundedRect = new Gsk.RoundedRect();
  roundedRect.init_from_rect(fullRect, height / 2);

  // Apply rounded clip
  snapshot.push_rounded_clip(roundedRect);

  if (bars === 0 || values.length === 0) return snapshot.pop();
  const builder = new Gsk.PathBuilder();
  builder.move_to(0, height);

  // Start with the first point
  let prevX = 0;
  let prevY =
    height * (1 - Math.pow(Math.max(Math.min(1, values[0]), 0), 0.75));

  // Create smooth curve through all points
  for (let i = 1; i < bars && i < values.length; i++) {
    const x = width * (i / (bars - 1));
    const y =
      height * (1 - Math.pow(Math.max(Math.min(1, values[i]), 0), 0.75));

    const controlX1 = (prevX + x) / 2;
    const controlY1 = prevY;
    const controlX2 = (prevX + x) / 2;
    const controlY2 = y;

    builder.cubic_to(controlX1, controlY1, controlX2, controlY2, x, y);

    prevX = x;
    prevY = y;
  }

  // Complete the path
  builder.line_to(width, height);
  builder.close();

  // Fill the path
  snapshot.append_fill(builder.to_path(), Gsk.FillRule.EVEN_ODD, color);

  // Remove the clip
  snapshot.pop();
}
