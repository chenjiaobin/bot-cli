export function hasFetch(): boolean {
  return typeof globalThis.fetch === 'function';
}
