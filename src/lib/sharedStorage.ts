const STORAGE_ROUTE = "/api/shared-storage";

const isBrowser = () => typeof window !== "undefined";

export const readSharedValue = async (key: string): Promise<string | null> => {
  if (!isBrowser()) return null;

  try {
    const response = await fetch(`${STORAGE_ROUTE}?key=${encodeURIComponent(key)}`, { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as { value?: string | null };
    return typeof data.value === "string" ? data.value : null;
  } catch (error) {
    console.warn(`Failed to read key ${key} from shared storage`, error);
    return null;
  }
};

export const persistSharedValue = async (key: string, value: string) => {
  if (!isBrowser()) return;

  try {
    const response = await fetch(STORAGE_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorDetail = await safeParseError(response);
      throw new Error(errorDetail ?? `Shared storage responded with ${response.status}`);
    }
  } catch (error) {
    console.warn(`Failed to persist key ${key} to shared storage`, error);
  }
};

export const deleteSharedValue = async (key: string) => {
  if (!isBrowser()) return;

  try {
    const response = await fetch(STORAGE_ROUTE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorDetail = await safeParseError(response);
      throw new Error(errorDetail ?? `Shared storage responded with ${response.status}`);
    }
  } catch (error) {
    console.warn(`Failed to delete key ${key} from shared storage`, error);
  }
};

async function safeParseError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error;
  } catch (error) {
    console.warn("Unable to parse shared storage error response", error);
    return null;
  }
}
