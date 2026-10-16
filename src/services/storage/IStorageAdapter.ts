export interface IStorageAdapter {
  getItem<T>(key: string, fallback: T): T;
  setItem(key: string, value: unknown): boolean;
  removeItem(key: string): void;
  clear(): void;
}
