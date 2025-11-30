import React from "react";
import Link from "next/link";

// TODO: replace with real data hooks wired to tRPC (e.g., useRecentFirings, useRecentProjects)
const mockRecentFirings = [
  {
    id: "1",
    kilnName: "Big Manual Kiln",
    firingType: "glaze",
    status: "ongoing",
    startTime: new Date().toISOString(),
    maxTemp: 1830,
  },
];

const mockRecentProjects = [
  {
    id: "p1",
    title: "Mug Set",
    clayBody: "B-Mix",
    createdAt: new Date().toISOString(),
    coverUrl: null,
  },
];

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Kiln Tracker Dashboard</h1>
        <p className="text-sm text-gray-600">
          Quick snapshot of recent firings and projects. TODO: replace mock data
          with live queries.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Firings</h2>
          <Link href="/firings" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {mockRecentFirings.map((firing) => (
            <Link
              key={firing.id}
              href={`/firings/${firing.id}`}
              className="border rounded p-3 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{firing.kilnName}</div>
                  <div className="text-sm text-gray-600">
                    {firing.firingType} • {firing.status}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <div>
                    Start: {new Date(firing.startTime).toLocaleString()}
                  </div>
                  <div>Max Temp: {firing.maxTemp ?? "—"}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link href="/projects" className="text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3">
          {mockRecentProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="border rounded p-3 hover:bg-gray-50 flex items-center gap-3"
            >
              <div className="h-12 w-12 bg-gray-200 rounded" aria-hidden>
                {/* TODO: render cover photo thumbnail */}
                {project.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.coverUrl}
                    alt={`${project.title} cover`}
                    className="h-12 w-12 object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-500">No photo</span>
                )}
              </div>
              <div>
                <div className="font-medium">
                  {project.title || project.clayBody || "Untitled project"}
                </div>
                <div className="text-sm text-gray-600">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
