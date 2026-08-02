export type CompassSensorState = 'idle' | 'running' | 'denied';

export const LEVEL_TOLERANCE: number;

export interface CompassSensorStore {
  supported: { value: boolean };
  state: { value: CompassSensorState };
  heading: { value: number | null };
  beta: { value: number | null };
  gamma: { value: number | null };
  level: { value: boolean };
  startCompass: () => Promise<void>;
  stopCompass: () => void;
}

export function useCompassSensor(): CompassSensorStore;
