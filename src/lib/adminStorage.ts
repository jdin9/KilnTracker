export const ADMIN_USERS_KEY = "kiln-admin-users";
export const ADMIN_CLAY_BODY_KEY = "kiln-admin-clay-bodies";
export const ADMIN_COLORS_KEY = "kiln-admin-colors";

const readArrayFromStorage = <T>(key: string, fallback: T[]): T[] => {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage`, error);
    return fallback;
  }
};

const persistArrayToStorage = <T>(key: string, values: T[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch (error) {
    console.warn(`Unable to persist ${key} to localStorage`, error);
  }
};

export const loadAdminUsers = <T>(fallback: T[]) => readArrayFromStorage(ADMIN_USERS_KEY, fallback);
export const persistAdminUsers = <T>(users: T[]) => persistArrayToStorage(ADMIN_USERS_KEY, users);

export const loadAdminClayBodies = <T>(fallback: T[]) =>
  readArrayFromStorage(ADMIN_CLAY_BODY_KEY, fallback);
export const persistAdminClayBodies = <T>(clays: T[]) =>
  persistArrayToStorage(ADMIN_CLAY_BODY_KEY, clays);

export const loadAdminStudioColors = <T>(fallback: T[]) => readArrayFromStorage(ADMIN_COLORS_KEY, fallback);
export const persistAdminStudioColors = <T>(colors: T[]) =>
  persistArrayToStorage(ADMIN_COLORS_KEY, colors);
