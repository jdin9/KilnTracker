"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import { initialClayBodies } from "@/lib/clayBodies";
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
  },
  {
    id: "p2",
    title: "Shino Serving Set",
    clayBody: initialClayBodies[1]?.name ?? "Porcelain P10",
    makerName: "Jamie",
    createdAt: new Date().toISOString(),
    coverUrl: null,
    glazes: ["Shino"],
  },
  {
    id: "p3",
    title: "Floating Blue Mugs",
    clayBody: initialClayBodies[2]?.name ?? "Speckled Buff",
    makerName: "Taylor",
    createdAt: new Date().toISOString(),
    coverUrl: null,
    glazes: ["Floating Blue"],
  },
];

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
  search?: string;
  clayBody?: string;
  selectedGlazes: string[];
};

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Filters>({ selectedGlazes: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [glazeDropdownOpen, setGlazeDropdownOpen] = useState(false);
  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);

  const clayBodyOptions = useMemo(() => initialClayBodies, []);
  const activeGlazes = useMemo(
    () => getActiveStudioColors(initialStudioColors),
    []
  );

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
      coverUrl: selectProjectCover(project),
    }));

    return [...storedWithCovers, ...mockProjects];
  }, [storedProjects]);

  const filteredProjects = useMemo(() => {
    return combinedProjects.filter((project) => {
      const matchesSearch = filters.search
        ? project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (project.makerName || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;

      const matchesClay = filters.clayBody
        ? project.clayBody === filters.clayBody
        : true;

      const matchesGlazes = filters.selectedGlazes.length
        ? (project.glazes || []).some((glaze) => filters.selectedGlazes.includes(glaze))
        : true;

      return matchesSearch && matchesClay && matchesGlazes;
    });
  }, [combinedProjects, filters.clayBody, filters.search, filters.selectedGlazes]);

  const toggleGlazeSelection = (glazeName: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedGlazes: prev.selectedGlazes.includes(glazeName)
        ? prev.selectedGlazes.filter((entry) => entry !== glazeName)
        : [...prev.selectedGlazes, glazeName],
    }));
  };

  const clearFilters = () => setFilters({ selectedGlazes: [] });

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

        <section className="grid gap-4 md:grid-cols-3">
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
          <div className="rounded-2xl bg-purple-600 p-4 text-white shadow-sm ring-1 ring-purple-500/50">
            <p className="text-xs font-semibold uppercase tracking-wide">Filters Applied</p>
            <p className="mt-2 text-2xl font-bold">{filters.selectedGlazes.length + (filters.search ? 1 : 0) + (filters.clayBody ? 1 : 0)}</p>
            <p className="text-sm text-purple-100">Use the filter dropdown to refine projects.</p>
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
                <label className="text-sm font-semibold text-gray-800" htmlFor="search">
                  Quick search
                </label>
                <p className="text-xs text-gray-600">Find by project name or maker.</p>
                <input
                  id="search"
                  type="text"
                  value={filters.search || ""}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, search: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  placeholder="e.g. Carved vase"
                />
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
                    {activeGlazes.map((color) => (
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
                    {activeGlazes.length === 0 && (
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
