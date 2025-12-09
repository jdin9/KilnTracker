import { persistSharedValue, readSharedValue } from "./sharedStorage";

export const ADMIN_USERS_KEY = "kiln-admin-users";
export const ADMIN_CLAY_BODY_KEY = "kiln-admin-clay-bodies";
export const ADMIN_COLORS_KEY = "kiln-admin-colors";
export const ADMIN_KILNS_KEY = "kiln-admin-kilns";

const isBrowser = () => typeof window !== "undefined";

const readArrayFromStorage = async <T>(key: string, fallback: T[]): Promise<T[]> => {
  if (!isBrowser()) return fallback;

  try {
    const sharedValue = await readSharedValue(key);
    if (sharedValue) {
      const parsed = JSON.parse(sharedValue);
      if (Array.isArray(parsed)) return parsed as T[];
    }

    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch (error) {
    console.warn(`Unable to read ${key} from shared storage`, error);
    return fallback;
  }
};

const persistArrayToStorage = async <T>(key: string, values: T[]) => {
  if (!isBrowser()) return;

  const serialized = JSON.stringify(values);

  try {
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    console.warn(`Unable to persist ${key} to localStorage`, error);
  }

  await persistSharedValue(key, serialized);
};

export const loadAdminUsers = async <T>(fallback: T[]) => readArrayFromStorage(ADMIN_USERS_KEY, fallback);
export const persistAdminUsers = async <T>(users: T[]) => persistArrayToStorage(ADMIN_USERS_KEY, users);

export const loadAdminClayBodies = async <T>(fallback: T[]) =>
  readArrayFromStorage(ADMIN_CLAY_BODY_KEY, fallback);
export const persistAdminClayBodies = async <T>(clays: T[]) =>
  persistArrayToStorage(ADMIN_CLAY_BODY_KEY, clays);

export const loadAdminStudioColors = async <T>(fallback: T[]) =>
  readArrayFromStorage(ADMIN_COLORS_KEY, fallback);
export const persistAdminStudioColors = async <T>(colors: T[]) =>
  persistArrayToStorage(ADMIN_COLORS_KEY, colors);

export const loadAdminKilns = async <T>(fallback: T[]) => readArrayFromStorage(ADMIN_KILNS_KEY, fallback);
export const persistAdminKilns = async <T>(kilns: T[]) => persistArrayToStorage(ADMIN_KILNS_KEY, kilns);
