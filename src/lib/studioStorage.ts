import { initialStudios, type Studio } from "./studios";

export const STUDIO_STORAGE_KEY = "kiln-studio-details";
export const STUDIO_PASSWORD_COOKIE = "studio-password";
export const SITE_ACCESS_COOKIE = "studio-access-granted";
export const DEFAULT_STUDIO = initialStudios[0];
export const DEFAULT_STUDIO_PASSWORD = DEFAULT_STUDIO.password;

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!match) return null;
  return decodeURIComponent(match.split("=")[1] ?? "");
}

export function readStudioDetailsFromStorage(): Studio | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STUDIO_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Studio;
    if (typeof parsed?.name === "string" && typeof parsed?.password === "string") {
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Failed to parse stored studio details", error);
    return null;
  }
}

export function ensureStudioPasswordCookie(password?: string) {
  if (typeof document === "undefined") return;
  const value = password ?? DEFAULT_STUDIO_PASSWORD;
  document.cookie = `${STUDIO_PASSWORD_COOKIE}=${encodeURIComponent(value)}; path=/`;
}

export function persistStudioDetails(details: Studio) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(details));
  ensureStudioPasswordCookie(details.password);
}

export function getClientStudioDetails(): Studio {
  if (typeof window === "undefined") return DEFAULT_STUDIO;
  return readStudioDetailsFromStorage() ?? DEFAULT_STUDIO;
}

export function getClientStudioPassword(): string {
  const cookieValue = readCookie(STUDIO_PASSWORD_COOKIE);
  if (cookieValue) return cookieValue;

  const stored = readStudioDetailsFromStorage();
  if (stored?.password) return stored.password;

  return DEFAULT_STUDIO_PASSWORD;
}

export function getSiteAccessCode() {
  return readCookie(SITE_ACCESS_COOKIE);
}

export function setSiteAccessCookie(code: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${SITE_ACCESS_COOKIE}=${encodeURIComponent(code)}; path=/`;
}
