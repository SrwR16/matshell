import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import Graphene from "gi://Graphene";

export function drawBars(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  // Bar spacing
  const spacing = 5;
  const barWidth = (width - spacing * bars) / bars;

  // Offset for the first bar
  snapshot.translate(new Graphene.Point().init(spacing / 2, 0));

  const pathBuilder = new Gsk.PathBuilder();

  // Draw bars as rectangle
  values.forEach((value, i) => {
    const x = i * (barWidth + spacing);
    const y = height;
    const barHeight = -value * height;

    pathBuilder.add_rect(new Graphene.Rect().init(x, y, barWidth, barHeight));
  });

  pathBuilder.close();

  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);

  snapshot.translate(new Graphene.Point().init(spacing / 2, 0));
}
