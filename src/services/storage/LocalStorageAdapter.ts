import type { IStorageAdapter } from './IStorageAdapter';

export class LocalStorageAdapter implements IStorageAdapter {
  getItem<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return fallback;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to read key "${key}":`, err);
      return fallback;
    }
  }

  setItem(key: string, value: unknown): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[LocalStorageAdapter] Failed to write key "${key}":`, err);
      return false;
    }
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[LocalStorageAdapter] Failed to remove key "${key}":`, err);
    }
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to clear storage:', err);
    }
  }
}

export class MemoryStorageAdapter implements IStorageAdapter {
  private store = new Map<string, string>();

  getItem<T>(key: string, fallback: T): T {
    const raw = this.store.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  setItem(key: string, value: unknown): boolean {
    try {
      this.store.set(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
