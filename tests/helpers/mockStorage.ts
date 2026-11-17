export class MockLocalStorage implements Storage {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys())
    return keys[index] ?? null
  }

  get length(): number {
    return this.store.size
  }

  dump(): Record<string, string> {
    return Object.fromEntries(this.store.entries())
  }
}

export interface MockBrowserEnv {
  storage: MockLocalStorage
  mockWindow: any
  reset: () => void
  cleanup: () => void
}

export function setupMockBrowser(): MockBrowserEnv {
  const storage = new MockLocalStorage()
  const listeners = new Map<string, Set<(e: any) => void>>()

  const mockWindow = {
    localStorage: storage,
    setInterval: () => 9999 as unknown as NodeJS.Timeout,
    clearInterval: () => {},
    setTimeout: (fn: (...args: any[]) => void, ms?: number) => setTimeout(fn, ms),
    clearTimeout: (id: any) => clearTimeout(id),
    addEventListener: (event: string, handler: (e: any) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(handler)
    },
    removeEventListener: (event: string, handler: (e: any) => void) => {
      listeners.get(event)?.delete(handler)
    },
    dispatchEvent: (event: { type: string; key?: string }) => {
      listeners.get(event.type)?.forEach((h) => h(event))
    },
  }

  ;(globalThis as any).window = mockWindow
  ;(globalThis as any).localStorage = storage

  return {
    storage,
    mockWindow,
    reset: () => {
      storage.clear()
      listeners.clear()
    },
    cleanup: () => {
      delete (globalThis as any).window
      delete (globalThis as any).localStorage
    },
  }
}
