'use client';

import React, { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";

type ActivityType = "dial" | "switch" | "temp" | "note" | "shutdown";

type Activity = {
  id: string;
  timestamp: string;
  type: ActivityType;
  note?: string;
  pyrometerTemp?: number;
  dialPosition?: "low" | "medium" | "high";
  switchName?: string;
  switchState?: string;
  photos?: string[];
};

type Firing = {
  id: string;
  kilnName: string;
  kilnModel: string;
  location: string;
  firingType: string;
  status: "open" | "closed";
  targetCone: string;
  targetTemp?: number;
  startTime: string;
  endTime?: string;
  maxTemp?: number;
};

const mockFiring: Firing = {
  id: "1",
  kilnName: "Big Manual Kiln",
  kilnModel: "Skutt KM1227",
  location: "Studio North",
  firingType: "glaze",
  status: "open",
  targetCone: "6",
  targetTemp: 2232,
  startTime: "2024-05-25T08:00:00Z",
};

const initialActivities: Activity[] = [
  { id: "e1", timestamp: "2024-05-25T08:00:00Z", type: "note", note: "Started candling" },
  { id: "e2", timestamp: "2024-05-25T10:00:00Z", type: "dial", dialPosition: "low", note: "Dial on low" },
  { id: "e3", timestamp: "2024-05-25T12:00:00Z", type: "temp", pyrometerTemp: 1100, note: "Switched to medium" },
];

const nowLocal = () => {
  const date = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getStoredFiring = (id: string): Firing | null => {
  if (typeof window === "undefined") return null;
  const open = window.localStorage.getItem("kiln-open-firings");
  const parsed = open ? JSON.parse(open) : [];
  const match = parsed.find((item: any) => item.id === id);
  if (!match) return null;

  return {
    id: match.id,
    kilnName: match.kilnName,
    kilnModel: match.kilnModel ?? "Manual kiln",
    location: match.location ?? "Studio",
    firingType: match.firingType ?? "bisque",
    status: "open",
    targetCone: match.targetCone,
    targetTemp: match.targetTemp,
    startTime: match.startedAt,
  };
};

export default function FiringDetailPage({ params }: { params: { id: string } }) {
  const [firing, setFiring] = useState<Firing | null>(null);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [form, setForm] = useState({
    type: "dial" as ActivityType,
    timestamp: nowLocal(),
    dialPosition: "low" as "low" | "medium" | "high",
    switchName: "",
    switchState: "off",
    pyrometerTemp: "",
    note: "",
    photos: [] as File[],
  });

  useEffect(() => {
    const fromStorage = getStoredFiring(params.id);
    setFiring(fromStorage ?? (params.id === mockFiring.id ? mockFiring : null));

    if (typeof window !== "undefined") {
      const storedEvents = window.localStorage.getItem(`firing-${params.id}-events`);
      if (storedEvents) {
        try {
          setActivities(JSON.parse(storedEvents));
        } catch (error) {
          console.error("Unable to parse stored firing events", error);
        }
      }
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`firing-${params.id}-events`, JSON.stringify(activities));
  }, [activities, params.id]);

  const sortedEvents = useMemo(
    () => [...activities].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [activities],
  );

  if (!firing) return notFound();

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === "shutdown" && !form.pyrometerTemp) {
      alert("Temperature is required when shutting down the kiln.");
      return;
    }

    const activity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date(form.timestamp).toISOString(),
      type: form.type,
      note: form.note || undefined,
      pyrometerTemp: form.pyrometerTemp ? Number(form.pyrometerTemp) : undefined,
      dialPosition: form.type === "dial" ? form.dialPosition : undefined,
      switchName: form.type === "switch" ? form.switchName || undefined : undefined,
      switchState: form.type === "switch" ? form.switchState || undefined : undefined,
      photos: form.photos.map((file) => file.name),
    };

    setActivities((prev) => [...prev, activity]);

    if (form.type === "shutdown") {
      const endTime = new Date(form.timestamp).toISOString();
      const updatedFiring: Firing = { ...firing, status: "closed", endTime, maxTemp: activity.pyrometerTemp };
      setFiring(updatedFiring);

      if (typeof window !== "undefined") {
        const open = window.localStorage.getItem("kiln-open-firings");
        const parsed = open ? JSON.parse(open) : [];
        const remaining = parsed.filter((item: any) => item.id !== firing.id);
        window.localStorage.setItem("kiln-open-firings", JSON.stringify(remaining));

        const history = window.localStorage.getItem("kiln-firing-history");
        const historyParsed = history ? JSON.parse(history) : [];
        window.localStorage.setItem(
          "kiln-firing-history",
          JSON.stringify([
            ...historyParsed,
            {
              id: firing.id,
              date: firing.startTime,
              kiln: firing.kilnName,
              targetCone: firing.targetCone,
              targetTemp: firing.targetTemp ?? 0,
              tempReached: activity.pyrometerTemp,
              status: "Completed",
            },
          ]),
        );
      }
    }

    setForm((prev) => ({ ...prev, note: "", pyrometerTemp: "", photos: [], timestamp: nowLocal() }));
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const statusLabel = firing.status === "open" ? "Open firing" : "Closed";

  return (
    <main className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">Kiln Tracker</p>
            <h1 className="text-3xl font-bold text-gray-900">{firing.kilnName} firing</h1>
            <p className="text-sm text-gray-700">
              {firing.firingType} • Target cone {firing.targetCone} • {statusLabel}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(firing.startTime).toLocaleString()}
              {firing.endTime && ` → ${new Date(firing.endTime).toLocaleString()}`} {firing.maxTemp && `| Max temp ${firing.maxTemp}°F`}
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-amber-100">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Kiln</dt>
                <dd className="font-semibold text-gray-900">{firing.kilnName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Model</dt>
                <dd className="font-semibold text-gray-900">{firing.kilnModel}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Location</dt>
                <dd className="font-semibold text-gray-900">{firing.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Target temp</dt>
                <dd className="font-semibold text-gray-900">{firing.targetTemp ? `${firing.targetTemp}°F` : "—"}</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-amber-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log activity</h2>
              <p className="text-sm text-gray-600">Dial turns, switch flips, temp checks, notes, and photos.</p>
            </div>
          </div>
          {firing.status === "closed" && (
            <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800 ring-1 ring-amber-100">
              This firing has been closed. Add a new firing to continue logging.
            </p>
          )}
          {firing.status === "open" && (
            <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleAddActivity}>
              <div className="space-y-1 lg:col-span-2">
                <label className="block text-sm font-medium">Activity type</label>
                <select
                  className="w-full rounded border px-2 py-1"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
                >
                  <option value="dial">Dial adjustment</option>
                  <option value="switch">Switch toggle</option>
                  <option value="temp">Temperature reading</option>
                  <option value="note">Note</option>
                  <option value="shutdown">Turn kiln off</option>
                </select>
              </div>

              <div className="space-y-1 lg:col-span-3">
                <label className="block text-sm font-medium">Time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded border px-2 py-1"
                  value={form.timestamp}
                  onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Auto-filled to now; adjust if logging after the fact.</p>
              </div>

              {form.type === "dial" && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium">Dial position</label>
                  <select
                    className="w-full rounded border px-2 py-1"
                    value={form.dialPosition}
                    onChange={(e) => setForm({ ...form, dialPosition: e.target.value as "low" | "medium" | "high" })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}

              {form.type === "switch" && (
                <div className="space-y-1 lg:col-span-2">
                  <label className="block text-sm font-medium">Switch</label>
                  <input
                    className="w-full rounded border px-2 py-1"
                    placeholder="e.g. Top element"
                    value={form.switchName}
                    onChange={(e) => setForm({ ...form, switchName: e.target.value })}
                  />
                  <label className="block text-sm font-medium">Position</label>
                  <select
                    className="w-full rounded border px-2 py-1"
                    value={form.switchState}
                    onChange={(e) => setForm({ ...form, switchState: e.target.value })}
                  >
                    <option value="off">Off</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="on">On</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-sm font-medium">Pyrometer temp (°F)</label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={form.pyrometerTemp}
                  onChange={(e) => setForm({ ...form, pyrometerTemp: e.target.value })}
                  placeholder="Optional, required on shutdown"
                />
              </div>

              <div className="space-y-1 lg:col-span-4">
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                  className="w-full rounded border px-2 py-2"
                  rows={2}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Dial changes, switch order, accidents, etc."
                />
              </div>

              <div className="space-y-1 lg:col-span-3">
                <label className="block text-sm font-medium">Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, photos: Array.from(e.target.files ?? []) })}
                />
                <p className="text-xs text-gray-500">Attach load photos or document accidents at any time.</p>
              </div>

              <div className="lg:col-span-5">
                <button
                  type="submit"
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
                >
                  Add activity
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity log</h2>
              <p className="text-sm text-gray-600">Manual dial and switch changes, temps, and notes.</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-amber-50/80">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{event.type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                  {event.dialPosition && (
                    <p className="text-xs text-gray-700">Dial: {event.dialPosition}</p>
                  )}
                  {event.switchName && (
                    <p className="text-xs text-gray-700">{event.switchName} → {event.switchState}</p>
                  )}
                  {event.note && <p className="text-sm text-gray-700">{event.note}</p>}
                  {event.photos && event.photos.length > 0 && (
                    <p className="text-xs text-gray-600">Photos: {event.photos.join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {event.pyrometerTemp !== undefined && (
                    <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                      {event.pyrometerTemp}°F
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="text-xs font-semibold text-amber-800 underline-offset-4 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {sortedEvents.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-600">No activity logged yet. Add the first reading above.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
