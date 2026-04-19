import { useState, useCallback } from 'react';

function readFromStorage<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return initialValue;
    return JSON.parse(item) as T;
  } catch {
    return initialValue;
  }
}

// Per-key debounce timers — 300ms delay reduces high-frequency writes.
const writeTimers = new Map<string, ReturnType<typeof setTimeout>>();

function writeToStorage<T>(key: string, value: T): void {
  const existing = writeTimers.get(key);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    writeTimers.delete(key);
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — silently ignore
    }
  }, 300);
  writeTimers.set(key, timer);
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readFromStorage(key, initialValue),
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value;
        writeToStorage(key, next);
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
