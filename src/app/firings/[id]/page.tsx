'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDateTime } from "@/lib/dateFormat";

type ActivityType = "dial" | "switch" | "temp" | "note" | "shutdown" | "close";

type Activity = {
  id: string;
  timestamp: string;
  type: ActivityType;
  note?: string;
  pyrometerTemp?: number;
  dialPosition?: string;
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
  loadPhotos?: string[];
  pieces?: { name: string; notes?: string }[];
  notes?: string;
};

type Kiln = {
  id: number;
  nickname: string;
  type: "manual" | "digital";
  manualControl?: "switches" | "dial";
  switches?: number;
  dialPositions?: string[];
};

const KILNS_STORAGE_KEY = "kiln-admin-kilns";
const defaultKilns: Kiln[] = [
  { id: 1, nickname: "Studio Workhorse", type: "digital" },
  { id: 2, nickname: "Manual Test Kiln", type: "manual", manualControl: "switches", switches: 3 },
  { id: 3, nickname: "Glaze Trials", type: "manual", manualControl: "dial", dialPositions: ["Low", "Medium", "High"] },
];

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

const defaultHistoryDetails: Record<string, { firing: Firing; activities: Activity[] }> = {
  "11": {
    firing: {
      id: "11",
      kilnName: "Big Manual Kiln",
      kilnModel: "Skutt KM1227",
      location: "Studio North",
      firingType: "glaze",
      status: "closed",
      targetCone: "6",
      targetTemp: 2232,
      startTime: "2024-05-25T08:00:00Z",
      endTime: "2024-05-25T22:10:00Z",
      maxTemp: 2225,
      loadPhotos: ["load-front.jpg", "load-side.jpg"],
      pieces: [
        { name: "Mugs (8)", notes: "Shino outside" },
        { name: "Dinner plates (4)", notes: "Celadon" },
      ],
      notes: "Smooth cone 6 glaze with long soak at the end.",
    },
    activities: [
      { id: "a1", timestamp: "2024-05-25T08:00:00Z", type: "note", note: "Loaded and candling" },
      { id: "a2", timestamp: "2024-05-25T10:00:00Z", type: "dial", dialPosition: "low", note: "Dial to low" },
      { id: "a3", timestamp: "2024-05-25T13:00:00Z", type: "switch", switchName: "Top", switchState: "on" },
      { id: "a4", timestamp: "2024-05-25T17:00:00Z", type: "temp", pyrometerTemp: 1900, note: "On schedule" },
      { id: "a5", timestamp: "2024-05-25T21:45:00Z", type: "shutdown", pyrometerTemp: 2225, note: "Kiln off" },
    ],
  },
  "12": {
    firing: {
      id: "12",
      kilnName: "Small Electric Kiln",
      kilnModel: "Olympic 1823E",
      location: "Studio Annex",
      firingType: "bisque",
      status: "closed",
      targetCone: "04",
      targetTemp: 1940,
      startTime: "2024-05-10T07:30:00Z",
      endTime: "2024-05-10T21:45:00Z",
      maxTemp: 1935,
      loadPhotos: ["test-bisque.jpg"],
      pieces: [
        { name: "Test tiles (12)" },
        { name: "Cups (6)", notes: "Handle stress test" },
      ],
      notes: "Held for 20 minutes at top temp; even firing.",
    },
    activities: [
      { id: "b1", timestamp: "2024-05-10T07:30:00Z", type: "note", note: "Bisque load" },
      { id: "b2", timestamp: "2024-05-10T12:00:00Z", type: "temp", pyrometerTemp: 1600, note: "On track" },
      { id: "b3", timestamp: "2024-05-10T18:30:00Z", type: "switch", switchName: "Bottom", switchState: "medium" },
      { id: "b4", timestamp: "2024-05-10T21:45:00Z", type: "shutdown", pyrometerTemp: 1935, note: "Power off" },
    ],
  },
  "13": {
    firing: {
      id: "13",
      kilnName: "Test Kiln",
      kilnModel: "Manual Dial Kiln",
      location: "Studio Backroom",
      firingType: "glaze",
      status: "closed",
      targetCone: "06",
      targetTemp: 1830,
      startTime: "2024-04-28T07:00:00Z",
      endTime: "2024-04-28T13:20:00Z",
      maxTemp: 1810,
      pieces: [
        { name: "Bowls (3)" },
        { name: "Tiles (5)", notes: "Ran cold; glaze pinholes" },
      ],
      notes: "Stopped early after uneven temp rise.",
    },
    activities: [
      { id: "c1", timestamp: "2024-04-28T07:00:00Z", type: "note", note: "Test firing" },
      { id: "c2", timestamp: "2024-04-28T09:00:00Z", type: "temp", pyrometerTemp: 1500 },
      { id: "c3", timestamp: "2024-04-28T11:30:00Z", type: "dial", dialPosition: "high", note: "Tried to push" },
      { id: "c4", timestamp: "2024-04-28T13:20:00Z", type: "shutdown", pyrometerTemp: 1810, note: "Aborted" },
    ],
  },
};

const OPEN_DETAIL_KEY = "kiln-open-firing-details";
const HISTORY_DETAIL_KEY = "kiln-firing-history-details";

const nowLocal = () => {
  const date = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getStoredFiring = (id: string): Firing | null => {
  if (typeof window === "undefined") return null;

  const detailedStore = window.localStorage.getItem(OPEN_DETAIL_KEY);
  if (detailedStore) {
    try {
      const parsed = JSON.parse(detailedStore);
      if (parsed[id]) return parsed[id] as Firing;
    } catch (error) {
      console.error("Unable to parse detailed firing store", error);
    }
  }

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

const getStoredHistoryFiring = (id: string): Firing | null => {
  if (typeof window === "undefined") return null;

  const historyDetailStore = window.localStorage.getItem(HISTORY_DETAIL_KEY);
  if (historyDetailStore) {
    try {
      const parsed = JSON.parse(historyDetailStore);
      if (parsed[id]) return parsed[id] as Firing;
    } catch (error) {
      console.error("Unable to parse firing history details", error);
    }
  }

  const history = window.localStorage.getItem("kiln-firing-history");
  const parsed = history ? JSON.parse(history) : [];
  const match = parsed.find((item: any) => item.id === id);
  if (!match) return null;

  return {
    id: match.id,
    kilnName: match.kiln,
    kilnModel: match.kilnModel ?? "Manual kiln",
    location: match.location ?? "Studio",
    firingType: match.firingType ?? "bisque",
    status: "closed",
    targetCone: match.targetCone,
    targetTemp: match.targetTemp,
    startTime: match.date,
    endTime: match.endTime,
    maxTemp: match.tempReached,
  };
};

export default function FiringDetailPage({ params }: { params: { id: string } }) {
  const [firing, setFiring] = useState<Firing | null>(null);
  const [kilnConfig, setKilnConfig] = useState<Kiln | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    timestamp: nowLocal(),
    dialPosition: "",
    switchName: "",
    switchState: "on",
    pyrometerTemp: "",
    note: "",
    photos: [] as File[],
    shutdown: false,
    closeFiring: false,
    tempOnly: false,
  });

  useEffect(() => {
    const fromOpen = getStoredFiring(params.id);
    const fromHistory = getStoredHistoryFiring(params.id);
    const fallbackHistory = defaultHistoryDetails[params.id];
    const resolvedFiring = fromOpen ?? fromHistory ?? fallbackHistory?.firing ?? (params.id === mockFiring.id ? mockFiring : null);
    setFiring(resolvedFiring);
    setLoading(false);

    if (typeof window !== "undefined") {
      const storedKilns = window.localStorage.getItem(KILNS_STORAGE_KEY);
      let kilnsSource: Kiln[] = defaultKilns;

      if (storedKilns) {
        try {
          kilnsSource = JSON.parse(storedKilns);
        } catch (error) {
          console.error("Unable to parse stored kiln configurations", error);
        }
      }

      const match = kilnsSource.find((kiln) => kiln.nickname === resolvedFiring?.kilnName);
      if (match) setKilnConfig(match);
    }

    if (typeof window !== "undefined") {
      const storedEvents = window.localStorage.getItem(`firing-${params.id}-events`);
      if (storedEvents) {
        try {
          setActivities(JSON.parse(storedEvents));
          return;
        } catch (error) {
          console.error("Unable to parse stored firing events", error);
        }
      }
    }

    if (fallbackHistory?.activities) {
      setActivities(fallbackHistory.activities);
    }
  }, [params.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`firing-${params.id}-events`, JSON.stringify(activities));
  }, [activities, params.id]);

  useEffect(() => {
    if (kilnConfig?.manualControl === "dial") {
      const firstPosition = kilnConfig.dialPositions?.find((position) => position.trim().length > 0) ?? "";
      if (firstPosition && !form.dialPosition) {
        setForm((prev) => ({ ...prev, dialPosition: firstPosition }));
      }
    }
  }, [kilnConfig, form.dialPosition]);

  useEffect(() => {
    if (kilnConfig?.manualControl === "switches") {
      const firstSwitchLabel = kilnConfig.switches && kilnConfig.switches > 0 ? `Switch 1` : "Switch 1";
      if (firstSwitchLabel && !form.switchName) {
        setForm((prev) => ({ ...prev, switchName: firstSwitchLabel, switchState: prev.switchState || "on" }));
      }
    }
  }, [kilnConfig, form.switchName]);

  const isDialKiln = kilnConfig?.type === "manual" && kilnConfig.manualControl === "dial";
  const isSwitchKiln = kilnConfig?.type === "manual" && kilnConfig.manualControl === "switches";
  const dialPositionOptions = (kilnConfig?.dialPositions ?? ["Low", "Medium", "High"]).filter(
    (position) => position.trim().length > 0,
  );
  const switchCount = kilnConfig?.switches ?? 0;
  const switchOptions = switchCount > 0 ? Array.from({ length: switchCount }, (_, index) => `Switch ${index + 1}`) : ["Switch 1"];

  const sortedEvents = useMemo(
    () => [...activities].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [activities],
  );

  if (!firing && !loading) return notFound();
  if (loading) {
    return (
      <main className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/80 p-6 shadow ring-1 ring-purple-100">
          <p className="text-sm font-semibold text-purple-800">Loading firing details…</p>
        </div>
      </main>
    );
  }

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const inferredType: ActivityType = form.closeFiring
      ? "close"
      : form.shutdown
        ? "shutdown"
        : form.tempOnly
          ? "temp"
          : kilnConfig?.manualControl === "dial" && form.dialPosition
            ? "dial"
            : isSwitchKiln && (form.switchName || form.switchState)
              ? "switch"
              : form.pyrometerTemp
                ? "temp"
                : "note";

    if (inferredType === "shutdown" && !form.pyrometerTemp) {
      alert("Temperature is required when shutting down the kiln.");
      return;
    }

    if (form.tempOnly && !form.pyrometerTemp) {
      alert("Temperature is required when logging a temp-only reading.");
      return;
    }

    const activity: Activity = {
      id: `act-${Date.now()}`,
      timestamp: new Date(form.timestamp).toISOString(),
      type: inferredType,
      note: form.note || undefined,
      pyrometerTemp: form.pyrometerTemp ? Number(form.pyrometerTemp) : undefined,
      dialPosition: inferredType === "dial" ? form.dialPosition : undefined,
      switchName: inferredType === "switch" ? form.switchName || undefined : undefined,
      switchState: inferredType === "switch" ? form.switchState || undefined : undefined,
      photos: form.photos.map((file) => file.name),
    };

    setActivities((prev) => [...prev, activity]);

    if (inferredType === "close") {
      const endTime = new Date(form.timestamp).toISOString();
      const updatedFiring: Firing = {
        ...firing,
        status: "closed",
        endTime,
        maxTemp: activity.pyrometerTemp ?? firing.maxTemp,
      };
      setFiring(updatedFiring);

      if (typeof window !== "undefined") {
        const open = window.localStorage.getItem("kiln-open-firings");
        const parsed = open ? JSON.parse(open) : [];
        const remaining = parsed.filter((item: any) => item.id !== firing.id);
        window.localStorage.setItem("kiln-open-firings", JSON.stringify(remaining));

        const openDetailRaw = window.localStorage.getItem(OPEN_DETAIL_KEY);
        const openDetails = openDetailRaw ? JSON.parse(openDetailRaw) : {};
        if (openDetails[firing.id]) {
          delete openDetails[firing.id];
          window.localStorage.setItem(OPEN_DETAIL_KEY, JSON.stringify(openDetails));
        }

        const historyDetailRaw = window.localStorage.getItem(HISTORY_DETAIL_KEY);
        const historyDetails = historyDetailRaw ? JSON.parse(historyDetailRaw) : {};
        const closedDetail: Firing = {
          ...firing,
          status: "closed",
          endTime,
          maxTemp: activity.pyrometerTemp ?? firing.maxTemp,
        };
        window.localStorage.setItem(
          HISTORY_DETAIL_KEY,
          JSON.stringify({
            ...historyDetails,
            [firing.id]: closedDetail,
          }),
        );

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
              kilnModel: firing.kilnModel,
              location: firing.location,
              firingType: firing.firingType,
              targetCone: firing.targetCone,
              targetTemp: firing.targetTemp,
              tempReached: activity.pyrometerTemp ?? firing.maxTemp,
              status: "Completed",
              endTime,
            },
          ]),
        );
      }
    }

    setForm((prev) => ({
      ...prev,
      note: "",
      pyrometerTemp: "",
      photos: [],
      timestamp: nowLocal(),
      switchName: "",
      switchState: "on",
      shutdown: false,
      closeFiring: false,
    }));
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const statusLabel = firing.status === "open" ? "Open firing" : "Closed";

  return (
    <main className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/kiln"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-purple-800 underline-offset-4 hover:underline"
            >
              ← Back to firings
            </Link>
            <div className="space-y-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Kiln Tracker</p>
              <h1 className="text-3xl font-bold text-gray-900">{firing.kilnName} firing</h1>
              <p className="text-sm text-gray-700">
                {firing.firingType} • Target cone {firing.targetCone} • {statusLabel}
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(firing.startTime)}
                {firing.endTime && ` → ${formatDateTime(firing.endTime)}`} {firing.maxTemp && `| Max temp ${firing.maxTemp}°F`}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-purple-100">
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

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Load & reference photos</h3>
                <p className="text-sm text-gray-600">Images captured when loading or documenting issues.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {firing.loadPhotos && firing.loadPhotos.length > 0 ? (
                firing.loadPhotos.map((photo) => (
                  <span
                    key={photo}
                    className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-100"
                  >
                    {photo}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-600">No photos logged for this firing.</p>
              )}
            </div>
            {firing.notes && <p className="mt-3 text-sm text-gray-700">Notes: {firing.notes}</p>}
          </div>

          <div className="rounded-3xl bg-white/90 p-4 shadow-lg ring-1 ring-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pieces in this firing</h3>
                <p className="text-sm text-gray-600">Reference what was loaded to track outcomes.</p>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {firing.pieces && firing.pieces.length > 0 ? (
                firing.pieces.map((piece) => (
                  <li key={piece.name} className="rounded-xl bg-purple-50 px-3 py-2 text-sm text-gray-800 ring-1 ring-purple-100">
                    <p className="font-semibold text-gray-900">{piece.name}</p>
                    {piece.notes && <p className="text-xs text-gray-700">{piece.notes}</p>}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-600">No pieces logged for this firing.</li>
              )}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log activity</h2>
              <p className="text-sm text-gray-600">Dial turns, switch flips, temp checks, notes, and photos.</p>
            </div>
          </div>
          {firing.status === "closed" && (
            <p className="rounded-xl bg-purple-50 px-4 py-2 text-sm text-purple-800 ring-1 ring-purple-100">
              This firing has been closed. Add a new firing to continue logging.
            </p>
          )}
          {firing.status === "open" && (
            <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleAddActivity}>
              <div className="space-y-1 lg:col-span-2">
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

              {isDialKiln && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium">Dial position</label>
                  <select
                    className={`w-full rounded border px-2 py-1 ${form.tempOnly ? "bg-gray-100 text-gray-500" : ""}`}
                    value={form.dialPosition}
                    onChange={(e) => setForm({ ...form, dialPosition: e.target.value })}
                    disabled={form.tempOnly}
                  >
                    {dialPositionOptions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">Options come from kiln settings in admin.</p>
                </div>
              )}

              {isSwitchKiln && (
                <div className="space-y-1 lg:col-span-2">
                  <label className="block text-sm font-medium">Switch</label>
                  <select
                    className={`w-full rounded border px-2 py-1 ${form.tempOnly ? "bg-gray-100 text-gray-500" : ""}`}
                    value={form.switchName}
                    onChange={(e) => setForm({ ...form, switchName: e.target.value })}
                    disabled={form.tempOnly}
                  >
                    {switchOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <label className="block text-sm font-medium">Position</label>
                  <select
                    className={`w-full rounded border px-2 py-1 ${form.tempOnly ? "bg-gray-100 text-gray-500" : ""}`}
                    value={form.switchState}
                    onChange={(e) => setForm({ ...form, switchState: e.target.value })}
                    disabled={form.tempOnly}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
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
                  placeholder="Optional; required when turning kiln off"
                />
              </div>

              <div className="flex items-center gap-2 lg:col-span-3">
                <input
                  type="checkbox"
                  checked={form.tempOnly}
                  onChange={(e) => setForm({ ...form, tempOnly: e.target.checked })}
                />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Log temperature only</p>
                  <p className="text-xs text-gray-500">Ignore dial and switch changes for this entry.</p>
                </div>
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

              <div className="flex flex-col gap-2 lg:col-span-5 md:flex-row md:items-center md:gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.shutdown}
                    onChange={(e) =>
                      setForm({ ...form, shutdown: e.target.checked, closeFiring: e.target.checked ? false : form.closeFiring })
                    }
                  />
                  Mark kiln shut down (logs end temperature)
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.closeFiring}
                    onChange={(e) =>
                      setForm({ ...form, closeFiring: e.target.checked, shutdown: e.target.checked ? false : form.shutdown })
                    }
                  />
                  Close firing (no more actions)
                </label>
              </div>

              <div className="lg:col-span-5">
                <button
                  type="submit"
                  className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-700"
                >
                  Add activity
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activity log</h2>
              <p className="text-sm text-gray-600">Manual dial and switch changes, temps, and notes.</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-purple-50/80">
            {sortedEvents.map((event) => (
              <div key={event.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{event.type.replace("_", " ")}</p>
                  <p className="text-xs text-gray-600">{formatDateTime(event.timestamp)}</p>
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
                    <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-200">
                      {event.pyrometerTemp}°F
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    className="text-xs font-semibold text-purple-800 underline-offset-4 hover:underline"
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
