import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import { GLib } from "astal";
import Graphene from "gi://Graphene";
import { ParticleState } from "./particles-base";

export function drawWaveParticles(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
  state: ParticleState,
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  // Timing
  const now = GLib.get_monotonic_time() / 1000000;
  const deltaTime = state.lastUpdate === 0 ? 0.016 : now - state.lastUpdate;
  state.lastUpdate = now;

  // First draw the wave and generate particles along it
  drawWaveAndGenerateParticles(
    state,
    snapshot,
    values,
    bars,
    width,
    height,
    color,
  );

  // Now update existing particles (but using custom update for wave particles)
  updateWaveParticles(state, deltaTime);

  // Draw all particles
  drawParticleShapes(state, snapshot, color);

  // Request next frame for animation
  widget.queue_draw();
}

// Draw the wave and generate particles along the curve
function drawWaveAndGenerateParticles(
  state: ParticleState,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
  width: number,
  height: number,
  color: any,
) {
  const pathBuilder = new Gsk.PathBuilder();
  pathBuilder.move_to(0, height - height * values[0]);

  const barWidth = width / (bars - 1);

  // Draw a smooth curve through all points
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

    // Generate particles above the wave line
    if (values[i] > 0.1) {
      const particleCount = Math.ceil(values[i] * 2);
      for (let p = 0; p < particleCount; p++) {
        // Position particles along the curve
        const t = Math.random(); // Position between this point and next point
        const x = p1.x + t * (p2.x - p1.x);
        const y = p1.y + t * (p2.y - p1.y);

        state.particles.push({
          x: x,
          y: y,
          velocity: -120 * values[i] * (Math.random() * 0.5 + 0.5),
          life: 1.0,
        });
      }
    }
  }

  // Complete and draw the wave
  pathBuilder.line_to(width, height);
  pathBuilder.line_to(0, height);
  pathBuilder.close();
  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);
}

// Custom update function for wave particles (different physics than base particles)
function updateWaveParticles(state: ParticleState, deltaTime: number) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const particle = state.particles[i];

    // Update particle position (no gravity for wave particles)
    particle.y += particle.velocity * deltaTime;
    particle.life -= deltaTime;

    // Remove dead particles
    if (particle.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // Limit particle count
  if (state.particles.length > 300) {
    state.particles.splice(0, state.particles.length - 300);
  }
}

// Helper function to draw all particles
function drawParticleShapes(
  state: ParticleState,
  snapshot: Gtk.Snapshot,
  color: any,
) {
  const particleBuilder = new Gsk.PathBuilder();
  const particleSize = 1.5; // Smaller particles for wave visualization

  for (const particle of state.particles) {
    particleBuilder.add_circle(
      new Graphene.Point().init(
        particle.x - particleSize / 2,
        particle.y - particleSize / 2,
      ),
      particleSize,
    );
  }

  snapshot.append_fill(particleBuilder.to_path(), Gsk.FillRule.WINDING, color);
}
