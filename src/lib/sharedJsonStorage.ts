import { deleteSharedValue, persistSharedValue, readSharedValue } from "./sharedStorage";

const isBrowser = () => typeof window !== "undefined";

export async function readSharedJson<T>(key: string, fallback: T): Promise<T> {
  if (!isBrowser()) return fallback;

  try {
    const shared = await readSharedValue(key);
    if (shared) {
      const parsed = JSON.parse(shared) as T;
      try {
        window.localStorage.setItem(key, shared);
      } catch (error) {
        console.warn(`Unable to mirror ${key} into localStorage`, error);
      }
      return parsed;
    }

    const local = window.localStorage.getItem(key);
    if (local) return JSON.parse(local) as T;
  } catch (error) {
    console.warn(`Unable to read ${key} from shared storage`, error);
  }

  return fallback;
}

export async function persistSharedJson<T>(key: string, value: T) {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(value);

  try {
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Unable to persist ${key} to localStorage`, error);
  }

  await persistSharedValue(key, serialized);
}

export async function deleteSharedJson(key: string) {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to remove ${key} from localStorage`, error);
  }

  await deleteSharedValue(key);
}
