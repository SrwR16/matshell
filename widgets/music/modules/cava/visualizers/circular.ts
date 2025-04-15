import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";

// Define a Point interface for type safety
interface Point {
  x: number;
  y: number;
}

export function drawCircular(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = (Math.min(width, height) / 2) * 2.5;

  // Path for the outer shape
  const pathBuilder = new Gsk.PathBuilder();

  // Average intensity for overall effects
  const avgIntensity =
    values.reduce((sum, val) => sum + val, 0) / values.length;

  // Proper type annotation
  const points: Point[] = [];

  // Perimeter points based on audio values
  for (let i = 0; i < bars && i < values.length; i++) {
    const angle = (i / bars) * Math.PI * 2;

    // Use exponential scaling for intensity
    const value = values[i];
    const amplifiedValue = Math.pow(value, 0.8);
    const radius = maxRadius * (0.1 + amplifiedValue * 0.9);

    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }

  //Extra points for smooth looping
  const allPoints: Point[] = [
    points[points.length - 1],
    ...points,
    points[0],
    points[1],
  ];

  // Start path
  pathBuilder.move_to(points[0].x, points[0].y);

  // Draw smooth curves Catmull-Rom spline
  for (let i = 0; i < points.length; i++) {
    const p0 = allPoints[i];
    const p1 = allPoints[i + 1];
    const p2 = allPoints[i + 2];
    const p3 = allPoints[i + 3];

    // Adjust tension factor
    const tension = 1 / 5;

    // Control points with adjusted tension
    const c1 = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension,
    };

    // Add Bezier curve to path
    pathBuilder.cubic_to(c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
  }

  pathBuilder.close();

  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);

  widget.queue_draw();
}
