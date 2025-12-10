import { persistSharedJson, readSharedJson } from "./sharedJsonStorage";

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

const defaultProjects: StoredProject[] = [];

export const loadStoredProjects = async (): Promise<StoredProject[]> => {
  const projects = await readSharedJson<StoredProject[]>(STORAGE_KEY, defaultProjects);
  return Array.isArray(projects) ? projects : defaultProjects;
};

export const saveStoredProject = async (project: StoredProject) => {
  const existing = await loadStoredProjects();
  const withoutDuplicate = existing.filter((entry) => entry.id !== project.id);
  const updated = [...withoutDuplicate, project];

  await persistSharedJson(STORAGE_KEY, updated);
};

export const deleteStoredProject = async (projectId: string) => {
  const existing = await loadStoredProjects();
  const updated = existing.filter((entry) => entry.id !== projectId);

  await persistSharedJson(STORAGE_KEY, updated);
};
