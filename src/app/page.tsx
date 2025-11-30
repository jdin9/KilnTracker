import React from "react";
import Link from "next/link";

const mockRecentFirings = [
  {
    id: "1",
    kilnName: "Big Manual Kiln",
    firingType: "Glaze",
    status: "Ongoing",
    startTime: new Date().toISOString(),
    maxTemp: 1830,
  },
  {
    id: "2",
    kilnName: "Test Kiln",
    firingType: "Bisque",
    status: "Cooling",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    maxTemp: 1945,
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
  {
    id: "p2",
    title: "Stoneware Dinner Plates",
    clayBody: "Speckled Brown",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    coverUrl: null,
  },
];

const kilnStatus = [
  {
    id: "k1",
    name: "Big Manual Kiln",
    temperature: 1435,
    targetTemperature: 1830,
    atmosphere: "Oxidation",
    progress: 68,
  },
  {
    id: "k2",
    name: "Test Kiln",
    temperature: 987,
    targetTemperature: 1945,
    atmosphere: "Reduction",
    progress: 42,
  },
];

const maintenanceTasks = [
  {
    id: "t1",
    title: "Vacuum kiln floor",
    due: "Due this week",
    urgency: "high",
  },
  {
    id: "t2",
    title: "Element check",
    due: "In 10 days",
    urgency: "medium",
  },
  {
    id: "t3",
    title: "Test cone pack",
    due: "Next firing",
    urgency: "low",
  },
];

const resources = [
  {
    title: "Firing schedule templates",
    href: "#",
    description: "Starter ramps and holds you can copy into new firings.",
  },
  {
    title: "Kiln maintenance checklist",
    href: "#",
    description: "Keep logs tidy with a recurring service routine.",
  },
  {
    title: "Studio safety overview",
    href: "#",
    description: "Key reminders for ventilation, PPE, and clay handling.",
  },
];

const summaryCards = [
  {
    label: "Firings this month",
    value: "8",
    helper: "2 ongoing • 1 cooling",
  },
  {
    label: "Average peak temp",
    value: "1945°F",
    helper: "Across last 5 firings",
  },
  {
    label: "Active projects",
    value: "6",
    helper: "3 glaze ready",
  },
  {
    label: "Maintenance",
    value: "3 tasks",
    helper: "1 due soon",
  },
];

function urgencyBadge(urgency: "high" | "medium" | "low") {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold";

  if (urgency === "high") {
    return <span className={`${base} bg-red-50 text-red-700`}>High</span>;
  }

  if (urgency === "medium") {
    return <span className={`${base} bg-amber-50 text-amber-700`}>Medium</span>;
  }

  return <span className={`${base} bg-emerald-50 text-emerald-700`}>Low</span>;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-amber-700 font-semibold">
                Kiln Tracker
              </p>
              <h1 className="text-3xl font-bold text-gray-900">Studio dashboard</h1>
              <p className="text-sm text-gray-600">
                First draft overview for firings, projects, and maintenance. Replace
                mock data with live hooks when backend wiring is ready.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/firings/new"
                className="rounded-lg bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700"
              >
                New firing
              </Link>
              <Link
                href="/projects/new"
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-900 shadow-sm hover:bg-gray-50"
              >
                New project
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="text-sm text-gray-500">{card.label}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {card.value}
                </div>
                <div className="text-xs text-gray-500">{card.helper}</div>
              </div>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Active kilns</h2>
                  <p className="text-sm text-gray-600">
                    Snapshot of temperature, atmosphere, and target ramp.
                  </p>
                </div>
                <Link href="/firings" className="text-sm font-semibold text-amber-700">
                  View all
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {kilnStatus.map((kiln) => (
                  <div
                    key={kiln.id}
                    className="rounded-xl border border-gray-100 bg-gradient-to-br from-white to-amber-50/40 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{kiln.name}</div>
                        <div className="text-xs text-gray-500">{kiln.atmosphere}</div>
                      </div>
                      <span className="text-xs font-semibold text-amber-700">
                        {kiln.progress}%
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                      <div>
                        <div className="text-gray-500">Current</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {kiln.temperature}°F
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Target</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {kiln.targetTemperature}°F
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${kiln.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recent firings</h2>
                  <p className="text-sm text-gray-600">Based on the last studio sessions.</p>
                </div>
                <Link href="/firings" className="text-sm font-semibold text-amber-700">
                  All firings
                </Link>
              </div>
              <div className="grid gap-3">
                {mockRecentFirings.map((firing) => (
                  <Link
                    key={firing.id}
                    href={`/firings/${firing.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:border-amber-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{firing.kilnName}</div>
                      <div className="text-sm text-gray-600">
                        {firing.firingType} • {firing.status}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-700">
                      <div>Start: {new Date(firing.startTime).toLocaleString()}</div>
                      <div>Max Temp: {firing.maxTemp ?? "—"}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent projects</h2>
                <Link href="/projects" className="text-sm font-semibold text-amber-700">
                  All projects
                </Link>
              </div>
              <div className="space-y-3">
                {mockRecentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2 hover:border-amber-200"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                      {project.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.coverUrl}
                          alt={`${project.title} cover`}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <span>No photo</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {project.title || project.clayBody || "Untitled project"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
                <Link href="/settings" className="text-sm font-semibold text-amber-700">
                  Configure
                </Link>
              </div>
              <div className="space-y-3">
                {maintenanceTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-xs text-gray-500">{task.due}</div>
                    </div>
                    {urgencyBadge(task.urgency as "high" | "medium" | "low")}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Reference</h2>
                <Link href="/settings" className="text-sm font-semibold text-amber-700">
                  Studio docs
                </Link>
              </div>
              <div className="space-y-3">
                {resources.map((resource) => (
                  <Link
                    key={resource.title}
                    href={resource.href}
                    className="block rounded-lg border border-gray-100 px-3 py-2 hover:border-amber-200"
                  >
                    <div className="font-medium text-gray-900">{resource.title}</div>
                    <div className="text-sm text-gray-600">{resource.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
