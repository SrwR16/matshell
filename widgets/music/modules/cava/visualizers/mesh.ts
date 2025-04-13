import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import Graphene from "gi://Graphene";

export function drawMesh(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  const rows = 8; // Gird rows
  const cellWidth = width / bars;
  const cellHeight = height / rows;

  for (let i = 0; i < bars && i < values.length; i++) {
    const value = values[i];
    const activeRows = Math.ceil(rows * value);

    for (let row = 0; row < activeRows; row++) {
      const opacity = 1 - (row / rows) * 0.9; // Fade out higher rows
      const cellY = height - (row + 1) * cellHeight;

      // Make copy of the color with the calculated opacity
      const cellColor = color.copy();
      cellColor.alpha = opacity;

      const pathBuilder = new Gsk.PathBuilder();

      // Draw cell
      pathBuilder.add_rect(
        new Graphene.Rect().init(
          i * cellWidth + 1,
          cellY + 1,
          cellWidth - 2,
          cellHeight - 2,
        ),
      );

      // Apply the color with appropriate opacity
      snapshot.append_fill(
        pathBuilder.to_path(),
        Gsk.FillRule.WINDING,
        cellColor,
      );
    }
  }
}
