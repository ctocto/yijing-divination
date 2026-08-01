export type CompassState = 'idle' | 'casting' | 'reading'

export interface CompassStore {
  state: { value: CompassState }
  selectedHexagram: { value: object | null }
  divinationResult: { value: object | null }
  selectedDirection: { value: string }
  customDirection: { value: string }
  direction: { value: string }
  drawHexagram: () => void
  selectHexagram: (h: object) => void
  clearSelection: () => void
  resetToIdle: () => void
}

export function useCompass(): CompassStore
