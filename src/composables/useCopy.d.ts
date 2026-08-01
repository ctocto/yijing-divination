export function useCopy(): {
  copied: { value: boolean }
  copyText: (text: string) => Promise<void>
}
