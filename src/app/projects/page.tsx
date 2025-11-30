'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";

// TODO: replace with real tRPC hooks, e.g., useProjects(filters)
const mockProjects = [
  {
    id: "p1",
    title: "Vase",
    clayBody: "B-Mix",
    makerName: "Alex",
    createdAt: new Date().toISOString(),
    coverUrl: null,
  },
];

type Filters = {
  glazeName?: string;
  clayBody?: string;
};

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const filteredProjects = useMemo(() => mockProjects, []);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-gray-600">Browse glaze projects.</p>
        </div>
        <Link
          href="/projects/new"
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          New Project
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Glaze Name Contains</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={filters.glazeName || ""}
            onChange={(e) => setFilters({ ...filters, glazeName: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Clay Body</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={filters.clayBody || ""}
            onChange={(e) => setFilters({ ...filters, clayBody: e.target.value })}
          />
        </div>
      </section>

      <section className="grid gap-3">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="border rounded p-3 flex items-center gap-3 hover:bg-gray-50"
          >
            <div className="h-14 w-14 bg-gray-200 rounded" aria-hidden>
              {/* TODO: show cover image */}
              {project.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.coverUrl}
                  alt={`${project.title} cover`}
                  className="h-14 w-14 object-cover rounded"
                />
              ) : (
                <span className="text-xs text-gray-500">No photo</span>
              )}
            </div>
            <div>
              <div className="font-medium">{project.title || "Untitled"}</div>
              <div className="text-sm text-gray-600">
                Clay: {project.clayBody} • Maker: {project.makerName}
              </div>
              <div className="text-xs text-gray-500">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
