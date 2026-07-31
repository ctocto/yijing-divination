export type CompassState = 'idle' | 'spinning' | 'reading'

export interface CompassStore {
  state: { value: CompassState }
  rotation: { value: number }
  selectedHexagram: { value: object | null }
  divinationResult: { value: object | null }
  selectedDirection: { value: string }
  customDirection: { value: string }
  direction: { value: string }
  setRotation: (deg: number) => void
  setState: (s: CompassState) => void
  palaceIndexAt: (deg: number) => number
  completeSpin: () => void
  selectHexagram: (h: object) => void
  clearSelection: () => void
  resetToIdle: () => void
}

export function useCompass(): CompassStore
