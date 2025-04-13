import { Gtk } from "astal/gtk4";
import Gsk from "gi://Gsk";
import { GLib } from "astal";
import Graphene from "gi://Graphene";
import { ParticleState, updateParticles } from "./particles-base";

export function drawParticles(
  widget: any,
  snapshot: Gtk.Snapshot,
  values: number[],
  bars: number,
  state: ParticleState
) {
  const width = widget.get_width();
  const height = widget.get_height();
  const color = widget.get_color();

  if (bars === 0 || values.length === 0) return;

  // Timing
  const now = GLib.get_monotonic_time() / 1000000;
  const deltaTime = state.lastUpdate === 0 ? 0.016 : now - state.lastUpdate;
  state.lastUpdate = now;

  // Limit deltaTime to prevent large jumps
  const limitedDeltaTime = Math.min(deltaTime, 0.05);

  // Generate new particles based on audio intensity
  generateParticles(state, values, bars, width, height);
  
  // Update existing particles
  updateParticles(state, limitedDeltaTime, height);

  // Draw all particles
  drawParticleShapes(state, snapshot, color);

  widget.queue_draw();
}

// Helper function to generate new particles based on audio values
function generateParticles(
  state: ParticleState, 
  values: number[], 
  bars: number, 
  width: number, 
  height: number
) {
  // Base number of particles per frame
  const particlesPerFrame = 10;

  // Calculate average audio intensity
  let avgIntensity = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Generate particles across the entire width
  const totalParticles = Math.ceil(particlesPerFrame * avgIntensity * 5);

  for (let p = 0; p < totalParticles; p++) {
    // Randomly select a position along the width
    const position = Math.random() * width;

    // Find which bar interval this position falls into
    const barWidth = width / (bars - 1);
    const barIndex = Math.min(bars - 2, Math.floor(position / barWidth));

    // Interpolate intensity between the two nearest bars
    const barPosition = position / barWidth - barIndex;
    const intensity =
      values[barIndex] * (1 - barPosition) +
      values[barIndex + 1] * barPosition;

    // Only create particles where there's audio activity
    if (intensity > 0.05) {
      state.particles.push({
        x: position,
        y: height,
        velocity: -300 * intensity * (Math.random() * 0.5 + 0.75),
        life: 1.0,
      });
    }
  }
}

// Helper function to draw all particles
function drawParticleShapes(
  state: ParticleState, 
  snapshot: Gtk.Snapshot, 
  color: any
) {
  const pathBuilder = new Gsk.PathBuilder();
  const particleSize = 2;

  for (const particle of state.particles) {
    pathBuilder.add_circle(
      new Graphene.Point().init(
        particle.x - particleSize / 2,
        particle.y - particleSize / 2
      ),
      particleSize
    );
  }

  snapshot.append_fill(pathBuilder.to_path(), Gsk.FillRule.WINDING, color);
}
