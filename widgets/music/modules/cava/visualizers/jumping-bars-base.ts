export interface JumpingBarsState {
  barVelocities: number[];
  barHeights: number[];
  lastUpdate: number;
}

export function createJumpingBarsState(): JumpingBarsState {
  return {
    barVelocities: [],
    barHeights: [],
    lastUpdate: 0,
  };
}
