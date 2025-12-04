export type StoredProject = {
  id: string;
  title: string;
  clayBody: string;
  makerName?: string;
  createdAt: string;
  notes?: string;
  bisqueTemp?: number;
  glazes?: string[];
  photos?: StoredProjectPhoto[];
  coverPhoto?: StoredProjectPhoto;
  steps: any[];
};

export type StoredProjectPhoto = {
  id: string;
  name: string;
  url: string;
};

const STORAGE_KEY = "kilntracker.projects";

const readStorage = (): StoredProject[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read stored projects", error);
    return [];
  }
};

export const loadStoredProjects = (): StoredProject[] => readStorage();

export const saveStoredProject = (project: StoredProject) => {
  if (typeof window === "undefined") return;

  const existing = readStorage();
  const withoutDuplicate = existing.filter((entry) => entry.id !== project.id);
  const updated = [...withoutDuplicate, project];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to persist project", error);
  }
};
