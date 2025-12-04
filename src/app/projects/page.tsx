"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { initialClayBodies } from "@/lib/clayBodies";
import { coneChart } from "@/lib/coneReference";
import { formatDate } from "@/lib/dateFormat";
import { getActiveStudioColors, initialStudioColors } from "@/lib/studioColors";
import { loadStoredProjects, StoredProject } from "@/lib/projectStorage";

// TODO: replace with real tRPC hooks, e.g., useProjects(filters)
const mockProjects = [
  {
    id: "p1",
    title: "Celadon Carved Vase",
    clayBody: initialClayBodies[0]?.name ?? "Stoneware 266",
    makerName: "Alex",
    createdAt: new Date().toISOString(),
    coverUrl: null,
    glazes: ["Celadon", "Satin White"],
    steps: [
      {
        id: "f1",
        type: "firing",
        cone: "6",
        peakTemp: 2232,
        firingDate: new Date().toISOString(),
        photos: [
          {
            id: "fp1",
            name: "Kiln at peak heat",
            url: "https://images.unsplash.com/photo-1470909752005-0ac27f5a9d6d?auto=format&fit=crop&w=1200&q=80",
          },
          {
            id: "fp2",
            name: "Fresh unload",
            url: "https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=1200&q=80",
          },
        ],
      },
    ],
  },
  {
    id: "p2",
    title: "Shino Serving Set",
    clayBody: initialClayBodies[1]?.name ?? "Porcelain P10",
    makerName: "Jamie",
    createdAt: new Date().toISOString(),
    coverUrl: null,
    glazes: ["Shino"],
    steps: [],
  },
  {
    id: "p3",
    title: "Floating Blue Mugs",
    clayBody: initialClayBodies[2]?.name ?? "Speckled Buff",
    makerName: "Taylor",
    createdAt: new Date().toISOString(),
    coverUrl: null,
    glazes: ["Floating Blue"],
    steps: [
      {
        id: "f2",
        type: "firing",
        cone: "10",
        peakTemp: 2381,
        firingDate: new Date().toISOString(),
        photos: [],
      },
    ],
  },
];

const collectProjectGlazes = (project: StoredProject) => {
  const glazesFromSteps = (project.steps || [])
    .filter((step: any) => step.type === "glaze" && step.glazeName)
    .map((step: any) => step.glazeName as string);

  const combined = [...(project.glazes || []), ...glazesFromSteps].filter(Boolean);
  return Array.from(new Set(combined));
};

const selectProjectCover = (project: StoredProject): string | null => {
  const firingWithPhotos =
    project.steps
      ?.slice()
      .reverse()
      .find((step: any) => step.type === "firing" && step.photos?.length) ?? null;

  if (firingWithPhotos) {
    return firingWithPhotos.photos[0]?.url || null;
  }

  return project.coverPhoto?.url || project.photos?.[0]?.url || null;
};

type Filters = {
  maker?: string;
  clayBody?: string;
  selectedGlazes: string[];
  cone?: string;
  showFired: boolean;
  showUnfired: boolean;
};

const defaultFilters: Filters = {
  selectedGlazes: [],
  showFired: true,
  showUnfired: true,
};

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [glazeDropdownOpen, setGlazeDropdownOpen] = useState(false);
  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);

  const clayBodyOptions = useMemo(() => initialClayBodies, []);
  const activeGlazes = useMemo(
    () => getActiveStudioColors(initialStudioColors),
    []
  );
  const coneOptions = useMemo(() => coneChart, []);

  React.useEffect(() => {
    const refreshStoredProjects = () => {
      setStoredProjects(loadStoredProjects());
    };

    refreshStoredProjects();
    window.addEventListener("storage", refreshStoredProjects);

    return () => window.removeEventListener("storage", refreshStoredProjects);
  }, []);

  const combinedProjects = useMemo(() => {
    const sortedStored = [...storedProjects].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const storedWithCovers = sortedStored.map((project) => ({
      ...project,
      glazes: collectProjectGlazes(project),
      coverUrl: selectProjectCover(project),
    }));

    const normalizedMocks = mockProjects.map((project) => ({
      ...project,
      glazes: collectProjectGlazes(project as StoredProject),
    }));

    return [...storedWithCovers, ...normalizedMocks];
  }, [storedProjects]);

  const makerOptions = useMemo(() => {
    const makers = new Set<string>();
    combinedProjects.forEach((project) => {
      if (project.makerName) {
        makers.add(project.makerName);
      }
    });

    return Array.from(makers).sort((a, b) => a.localeCompare(b));
  }, [combinedProjects]);

  const glazeFilterOptions = useMemo(() => {
    const options = [...activeGlazes];
    const existing = new Set(options.map((glaze) => glaze.name));
    let dynamicId = 1000;

    combinedProjects.forEach((project) => {
      collectProjectGlazes(project).forEach((glaze) => {
        if (!existing.has(glaze)) {
          options.push({ id: dynamicId++, name: glaze, brand: "Logged glaze", retired: false });
          existing.add(glaze);
        }
      });
    });

    return options;
  }, [activeGlazes, combinedProjects]);

  const filteredProjects = useMemo(() => {
    return combinedProjects.filter((project) => {
      const projectSteps = project.steps || [];
      const hasFiring = projectSteps.some((step: any) => step.type === "firing");

      const matchesMaker = filters.maker
        ? (project.makerName || "") === filters.maker
        : true;

      const matchesClay = filters.clayBody
        ? project.clayBody === filters.clayBody
        : true;

      const matchesGlazes = filters.selectedGlazes.length
        ? collectProjectGlazes(project).some((glaze) => filters.selectedGlazes.includes(glaze))
        : true;

      const matchesCone = filters.cone
        ? projectSteps.some(
            (step: any) => step.type === "firing" && step.cone === filters.cone
          )
        : true;

      const matchesFiringStatus = (() => {
        if (filters.showFired && filters.showUnfired) return true;
        if (filters.showFired) return hasFiring;
        if (filters.showUnfired) return !hasFiring;
        return false;
      })();

      return (
        matchesMaker &&
        matchesClay &&
        matchesGlazes &&
        matchesCone &&
        matchesFiringStatus
      );
    });
  }, [
    combinedProjects,
    filters.clayBody,
    filters.cone,
    filters.maker,
    filters.selectedGlazes,
    filters.showFired,
    filters.showUnfired,
  ]);

  const fireGalleryItems = useMemo(() => {
    const galleryEntries = filteredProjects.flatMap((project) => {
      const steps = project.steps || [];

      return steps
        .filter((step: any) => step.type === "firing")
        .flatMap((step: any) => {
          const stepPhotos = step.photos || [];
          return stepPhotos.map((photo: any, index: number) => ({
            id: `${project.id}-${step.id}-${photo.id || index}`,
            photo,
            projectTitle: project.title || "Untitled",
            projectId: project.id,
            firingDate: step.firingDate,
            cone: step.cone,
            clayBody: project.clayBody,
            glazes: collectProjectGlazes(project),
          }));
        });
    });

    return galleryEntries.sort(
      (a, b) =>
        new Date(b.firingDate || 0).getTime() - new Date(a.firingDate || 0).getTime()
    );
  }, [filteredProjects]);

  const toggleGlazeSelection = (glazeName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedGlazes: prev.selectedGlazes.includes(glazeName)
        ? prev.selectedGlazes.filter((entry) => entry !== glazeName)
        : [...prev.selectedGlazes, glazeName],
    }));
  };

  const clearFilters = () => setFilters({ ...defaultFilters });

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow"
            >
              ← Back to home
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Pottery tracker</p>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-600">
                Browse pieces by glaze, clay body, and maker to keep the studio organized.
              </p>
            </div>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-purple-700"
          >
            + New Project
          </Link>
        </div>

        <section className="space-y-4 rounded-2xl border border-purple-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Firing gallery</p>
              <h2 className="text-xl font-bold text-gray-900">Recent firing photos</h2>
              <p className="text-sm text-gray-600">
                Only firing activity photos from projects that match the current filters.
              </p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">
              {fireGalleryItems.length} photo{fireGalleryItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {fireGalleryItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fireGalleryItems.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/projects/${entry.projectId}`}
                  className="group overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-white via-white to-purple-50 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.photo.url}
                      alt={entry.photo.name || `${entry.projectTitle} firing photo`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-white drop-shadow">
                      <span>
                        {entry.firingDate ? formatDate(entry.firingDate) : "Firing date not set"}
                      </span>
                      {entry.cone ? <span className="rounded-full bg-white/20 px-2 py-1">Cone {entry.cone}</span> : null}
                    </div>
                  </div>

                  <div className="space-y-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{entry.projectTitle}</p>
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-800">
                        {entry.clayBody}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {entry.glazes.length > 0 ? (
                        entry.glazes.map((glaze) => (
                          <span
                            key={glaze}
                            className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-800"
                          >
                            {glaze}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600">No glaze logged</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-white/70 px-6 py-10 text-center text-gray-600">
              No firing photos match the current filters yet. Try adjusting them or log a firing photo.
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-purple-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Active Glazes</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{activeGlazes.length}</p>
            <p className="text-sm text-gray-600">Ready to use in the studio</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-purple-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Total Projects</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{combinedProjects.length}</p>
            <p className="text-sm text-gray-600">Across all makers</p>
          </div>
        </section>

        <div className="rounded-2xl border border-purple-100 bg-white/90 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Filters</p>
              <p className="text-sm text-gray-700">Press the dropdown to choose how you want to narrow results.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-800 transition hover:border-purple-300 hover:bg-purple-50"
              >
                {filtersOpen ? "Hide filters" : "Filter dropdown"}
                <span aria-hidden>{filtersOpen ? "▲" : "▼"}</span>
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-gray-600 transition hover:text-gray-800"
              >
                Reset
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="divide-y divide-purple-100 border-t border-purple-100 px-6">
              <div className="py-4">
                <label className="text-sm font-semibold text-gray-800" htmlFor="maker">
                  Maker
                </label>
                <p className="text-xs text-gray-600">Filter by who created the project.</p>
                <select
                  id="maker"
                  value={filters.maker || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      maker: event.target.value ? event.target.value : undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Any maker</option>
                  {makerOptions.map((maker) => (
                    <option key={maker} value={maker}>
                      {maker}
                    </option>
                  ))}
                </select>
              </div>

              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setGlazeDropdownOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-xl bg-purple-50 px-4 py-3 text-left text-sm font-semibold text-purple-800 transition hover:bg-purple-100"
                >
                  <span>Glaze dropdown</span>
                  <span aria-hidden>{glazeDropdownOpen ? "▲" : "▼"}</span>
                </button>

                {glazeDropdownOpen && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {glazeFilterOptions.map((color) => (
                      <label
                        key={color.id}
                        className="flex items-start gap-3 rounded-xl border border-purple-100 bg-white px-3 py-3 text-sm text-gray-800 shadow-inner transition hover:border-purple-200"
                      >
                        <input
                          type="checkbox"
                          checked={filters.selectedGlazes.includes(color.name)}
                          onChange={() => toggleGlazeSelection(color.name)}
                          className="mt-1 h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="font-semibold">{color.name}</p>
                          <p className="text-xs text-gray-600">{color.brand}</p>
                        </div>
                      </label>
                    ))}
                    {glazeFilterOptions.length === 0 && (
                      <p className="text-sm text-gray-600">No active glazes found.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="py-4">
                <label className="text-sm font-semibold text-gray-800" htmlFor="clay-body">
                  Clay body
                </label>
                <p className="text-xs text-gray-600">Choose from available clay bodies.</p>
                <select
                  id="clay-body"
                  value={filters.clayBody || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      clayBody: event.target.value ? event.target.value : undefined,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Any clay body</option>
                  {clayBodyOptions.map((clay) => (
                    <option key={clay.id} value={clay.name}>
                      {clay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 py-4 md:grid-cols-2 md:items-end">
                <div>
                  <label className="text-sm font-semibold text-gray-800" htmlFor="cone">
                    Firing cone
                  </label>
                  <p className="text-xs text-gray-600">Show projects with firings at a specific cone.</p>
                  <select
                    id="cone"
                    value={filters.cone || ""}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        cone: event.target.value ? event.target.value : undefined,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Any cone</option>
                    {coneOptions.map((entry) => (
                      <option key={entry.cone} value={entry.cone}>
                        Cone {entry.cone} ({entry.temperatureF}°F)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 rounded-xl border border-purple-100 bg-white px-4 py-3 shadow-inner">
                  <p className="text-sm font-semibold text-gray-800">Firing status</p>
                  <p className="text-xs text-gray-600">
                    Choose whether to see projects with firing activity logged.
                  </p>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={filters.showFired}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            showFired: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Show fired</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-800">
                      <input
                        type="checkbox"
                        checked={filters.showUnfired}
                        onChange={(event) =>
                          setFilters((prev) => ({
                            ...prev,
                            showUnfired: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Show not fired</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-indigo-50 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100 text-sm font-semibold text-purple-800">
                  {project.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.coverUrl}
                      alt={`${project.title} cover`}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  ) : (
                    <span>{project.title.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                      {project.clayBody}
                    </span>
                    {(project.glazes || []).map((glaze) => (
                      <span
                        key={glaze}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800"
                      >
                        {glaze}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{project.title || "Untitled"}</h3>
                    <p className="text-sm text-gray-600">
                      Maker: {project.makerName} • Created {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-purple-200 bg-white/80 p-8 text-center text-gray-600">
              No projects match those filters yet. Try clearing them or create something new.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
