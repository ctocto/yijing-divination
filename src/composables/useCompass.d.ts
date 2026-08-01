export type CompassState = 'idle' | 'spinning' | 'casting' | 'reading' | 'browse'

export interface CompassStore {
  state: { value: CompassState }
  rotation: { value: number }
  selectedHexagram: { value: object | null }
  divinationResult: { value: object | null }
  selectedDirection: { value: string }
  customDirection: { value: string }
  direction: { value: string }
  currentPalaceName: { value: string }
  setRotation: (deg: number) => void
  setState: (s: CompassState) => void
  palaceIndexAt: (deg: number) => number
  completeSpin: () => void
  castSpin: () => void
  selectHexagram: (h: object) => void
  clearSelection: () => void
  resetToIdle: () => void
  openLibrary: () => void
  closeLibrary: () => void
}

export function useCompass(): CompassStore
