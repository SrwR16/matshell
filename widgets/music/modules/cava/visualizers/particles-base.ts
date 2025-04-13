export interface ParticleState {
  particles: Array<{
    x: number;
    y: number;
    velocity: number;
    life: number;
  }>;
  lastUpdate: number;
}

export function createParticleState(): ParticleState {
  return {
    particles: [],
    lastUpdate: 0,
  };
}

// Basic particle management functions that both visualizations can use
export function updateParticles(
  state: ParticleState,
  deltaTime: number,
  height: number,
) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const particle = state.particles[i];

    // Update particle position
    particle.y += particle.velocity * deltaTime;
    particle.velocity += 120 * deltaTime; // Gravity
    particle.life -= deltaTime * 0.1; // Fade out

    // Remove dead particles
    if (particle.life <= 0 || particle.y > height) {
      state.particles.splice(i, 1);
    }
  }

  // Limit particle count
  if (state.particles.length > 600) {
    state.particles.splice(0, state.particles.length - 600);
  }
}
