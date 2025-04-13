import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import Graphene from "gi://Graphene";

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
  const maxRadius = (Math.min(width, height) / 2) * 0.95; // Use more space

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

  // More intensity with multiple pulsing inner circles
  drawInnerElements(snapshot, centerX, centerY, maxRadius, avgIntensity, color);

  // Radiating lines for more dynamic effect
  drawRadiatingLines(
    snapshot,
    centerX,
    centerY,
    maxRadius,
    values,
    bars,
    color,
  );

  widget.queue_draw();
}

// Inner circles that pulse with the music
function drawInnerElements(
  snapshot: Gtk.Snapshot,
  centerX: number,
  centerY: number,
  maxRadius: number,
  intensity: number,
  color: any,
) {
  // Pulsing center circle - size changes with audio intensity
  const innerCircleRadius = maxRadius * (0.08 + intensity * 0.12);
  const innerCircleBuilder = new Gsk.PathBuilder();
  innerCircleBuilder.add_circle(
    new Graphene.Point().init(centerX, centerY),
    innerCircleRadius,
  );
  snapshot.append_fill(
    innerCircleBuilder.to_path(),
    Gsk.FillRule.WINDING,
    color,
  );

  // Add a semi-transparent outer ring
  const outerRingBuilder = new Gsk.PathBuilder();
  const ringRadius = maxRadius * (0.15 + intensity * 0.15);
  outerRingBuilder.add_circle(
    new Graphene.Point().init(centerX, centerY),
    ringRadius,
  );

  // Color with transparency
  const ringColor = color.copy();
  ringColor.alpha = 0.3;
  snapshot.append_stroke(
    outerRingBuilder.to_path(),
    ringColor,
    maxRadius * 0.01,
    new Gsk.StrokeOptions(),
  );
}

// Radiating lines that respond to individual frequency bands
function drawRadiatingLines(
  snapshot: Gtk.Snapshot,
  centerX: number,
  centerY: number,
  maxRadius: number,
  values: number[],
  bars: number,
  color: any,
) {
  // Only draw lines for some bars to avoid overcrowding
  const lineBuilder = new Gsk.PathBuilder();
  const lineInterval = Math.max(1, Math.floor(bars / 16)); // Up to 16 lines

  for (let i = 0; i < bars && i < values.length; i += lineInterval) {
    const angle = (i / bars) * Math.PI * 2;

    // Line length varies with audio intensity
    const lineLength = maxRadius * (0.4 + values[i] * 0.6);

    const startX = centerX + Math.cos(angle) * (maxRadius * 0.2);
    const startY = centerY + Math.sin(angle) * (maxRadius * 0.2);
    const endX = centerX + Math.cos(angle) * lineLength;
    const endY = centerY + Math.sin(angle) * lineLength;

    lineBuilder.move_to(startX, startY);
    lineBuilder.line_to(endX, endY);
  }

  // Semi-transparent
  const lineColor = color.copy();
  lineColor.alpha = 0.5;
  snapshot.append_stroke(
    lineBuilder.to_path(),
    lineColor,
    maxRadius * 0.005, // Thin lines
    new Gsk.StrokeOptions(),
  );
}
