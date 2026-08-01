export type CompassSensorState = 'idle' | 'running' | 'denied';

export interface CompassSensorStore {
  supported: { value: boolean };
  state: { value: CompassSensorState };
  heading: { value: number | null };
  startCompass: () => Promise<void>;
  stopCompass: () => void;
}

export function useCompassSensor(): CompassSensorStore;
