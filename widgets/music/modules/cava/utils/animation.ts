import { GLib } from "astal";

export interface TimeState {
  lastUpdate: number;
}

export function calculateTimeDelta(state: TimeState): number {
  const now = GLib.get_monotonic_time() / 1000000;
  const deltaTime = state.lastUpdate === 0 ? 0.016 : now - state.lastUpdate;
  state.lastUpdate = now;
  return Math.min(0.05, deltaTime);
}
