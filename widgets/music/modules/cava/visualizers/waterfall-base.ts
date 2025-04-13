// visualizers/waterfall-base.ts
export interface WaterfallState {
  historyFrames: number[][];
  maxHistoryFrames: number;
  transitionAlpha: number;
}

export function createWaterfallState(): WaterfallState {
  return {
    historyFrames: [],
    maxHistoryFrames: 16, // Increased for smoother vertical transition
    transitionAlpha: 0.3, // Controls how quickly new frames blend in
  };
}
