const STORAGE_ROUTE = "/api/shared-storage";

const isBrowser = () => typeof window !== "undefined";

export const readSharedValue = async (key: string): Promise<string | null> => {
  if (!isBrowser()) return null;

  try {
    const response = await fetch(`${STORAGE_ROUTE}?key=${encodeURIComponent(key)}`);
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
    await fetch(STORAGE_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key, value }),
    });
  } catch (error) {
    console.warn(`Failed to persist key ${key} to shared storage`, error);
  }
};

export const deleteSharedValue = async (key: string) => {
  if (!isBrowser()) return;

  try {
    await fetch(STORAGE_ROUTE, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    });
  } catch (error) {
    console.warn(`Failed to delete key ${key} from shared storage`, error);
  }
};
