import { useCallback, useEffect, useRef, useState } from "react";

type StorageArea = "sync" | "local";

const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== "undefined" && chrome.storage != null;
};

const getStorageArea = (
  area: StorageArea,
): chrome.storage.StorageArea | null => {
  if (!isChromeStorageAvailable()) return null;
  return area === "local" ? chrome.storage.local : chrome.storage.sync;
};

export const useStorage = <T>(
  key: string,
  defaultValue: T,
  area: StorageArea = "sync",
): [T, (value: T) => Promise<void>, boolean] => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  const valueRef = useRef<T>(defaultValue);
  valueRef.current = value;

  useEffect(() => {
    const storageArea = getStorageArea(area);
    if (storageArea) {
      storageArea.get([key], (result) => {
        if (result[key] !== undefined) {
          setValue(result[key] as T);
        }
        setLoading(false);
      });
    } else {
      try {
        const raw = localStorage.getItem(`mortality__${key}`);
        if (raw !== null) setValue(JSON.parse(raw) as T);
      } catch {
        // malformed storage — ignore and use default
      }
      setLoading(false);
    }
  }, [key, area]);

  const set = useCallback(
    async (newValue: T): Promise<void> => {
      setValue(newValue);

      const storageArea = getStorageArea(area);
      if (storageArea) {
        return new Promise<void>((resolve, reject) => {
          storageArea.set({ [key]: newValue }, () => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve();
          });
        });
      } else {
        localStorage.setItem(`mortality__${key}`, JSON.stringify(newValue));
      }
    },
    [key, area],
  );

  return [value, set, loading];
};
