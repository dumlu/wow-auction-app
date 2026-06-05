const PREFIX = 'wow-auction:'

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function storageSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    console.warn('localStorage write failed', key)
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
