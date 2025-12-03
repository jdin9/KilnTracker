'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { formatDate, formatDateTime } from "@/lib/dateFormat";

type OpenFiring = {
  id: string;
  kilnName: string;
  status: string;
  targetCone: string;
  targetTemp?: number;
  startedAt: string;
};

type LoadedPiece = {
  name: string;
  notes?: string;
};

type FiringHistoryRow = {
  id: string;
  date: string;
  kiln: string;
  kilnModel?: string;
  location?: string;
  firingType?: string;
  targetCone: string;
  targetTemp?: number;
  tempReached?: number;
  status: string;
  loadPhotos?: string[];
  pieces?: LoadedPiece[];
  endTime?: string;
};

const defaultOpenFirings: OpenFiring[] = [
  {
    id: "1",
    kilnName: "Big Manual Kiln",
    status: "Ramp 2",
    targetCone: "6",
    targetTemp: 2232,
    startedAt: "2024-06-02T08:15:00Z",
  },
  {
    id: "2",
    kilnName: "Test Kiln",
    status: "Candling",
    targetCone: "04",
    targetTemp: 1940,
    startedAt: "2024-06-03T06:30:00Z",
  },
];

const defaultHistory: FiringHistoryRow[] = [
  {
    id: "11",
    date: "2024-05-25T12:00:00Z",
    kiln: "Big Manual Kiln",
    kilnModel: "Skutt KM1227",
    location: "Studio North",
    firingType: "glaze",
    targetCone: "6",
    targetTemp: 2232,
    tempReached: 2225,
    status: "Completed",
    endTime: "2024-05-25T22:10:00Z",
    loadPhotos: ["load-front.jpg", "load-side.jpg"],
    pieces: [
      { name: "Mugs (8)", notes: "Shino outside" },
      { name: "Dinner plates (4)", notes: "Celadon" },
    ],
  },
  {
    id: "12",
    date: "2024-05-10T14:30:00Z",
    kiln: "Small Electric Kiln",
    kilnModel: "Olympic 1823E",
    location: "Studio Annex",
    firingType: "bisque",
    targetCone: "04",
    targetTemp: 1940,
    tempReached: 1935,
    status: "Completed",
    endTime: "2024-05-10T21:45:00Z",
    loadPhotos: ["test-bisque.jpg"],
    pieces: [
      { name: "Test tiles (12)" },
      { name: "Cups (6)", notes: "Handle stress test" },
    ],
  },
  {
    id: "13",
    date: "2024-04-28T10:45:00Z",
    kiln: "Test Kiln",
    kilnModel: "Manual Dial Kiln",
    location: "Studio Backroom",
    firingType: "glaze",
    targetCone: "06",
    targetTemp: 1830,
    tempReached: 1810,
    status: "Aborted",
    endTime: "2024-04-28T13:20:00Z",
    pieces: [
      { name: "Bowls (3)" },
      { name: "Tiles (5)", notes: "Ran cold; glaze pinholes" },
    ],
  },
];

export default function KilnDashboardPage() {
  const [openFirings, setOpenFirings] = useState<OpenFiring[]>(defaultOpenFirings);
  const [firingHistory, setFiringHistory] = useState<FiringHistoryRow[]>(defaultHistory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedKiln, setSelectedKiln] = useState<string>("all");
  const [selectedCone, setSelectedCone] = useState<string>("all");
  const [minReached, setMinReached] = useState<string>("");
  const [maxReached, setMaxReached] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const open = window.localStorage.getItem("kiln-open-firings");
    const history = window.localStorage.getItem("kiln-firing-history");

    try {
      if (open) {
        setOpenFirings(JSON.parse(open));
      } else {
        window.localStorage.setItem("kiln-open-firings", JSON.stringify(defaultOpenFirings));
      }
    } catch (error) {
      console.error("Unable to parse open firings", error);
    }

    try {
      if (history) {
        setFiringHistory(JSON.parse(history));
      } else {
        window.localStorage.setItem("kiln-firing-history", JSON.stringify(defaultHistory));
      }
    } catch (error) {
      console.error("Unable to parse firing history", error);
    }
  }, []);

  const kilnOptions = useMemo(() => {
    const kilnNames = firingHistory.map((firing) => firing.kiln);
    return Array.from(new Set(kilnNames));
  }, [firingHistory]);

  const coneOptions = useMemo(() => {
    const cones = firingHistory.map((firing) => firing.targetCone);
    return Array.from(new Set(cones));
  }, [firingHistory]);

  const filteredHistory = useMemo(() => {
    return firingHistory.filter((firing) => {
      if (selectedKiln !== "all" && firing.kiln !== selectedKiln) return false;
      if (selectedCone !== "all" && firing.targetCone !== selectedCone) return false;

      const firingDate = new Date(firing.date);
      if (startDate && firingDate < new Date(startDate)) return false;
      if (endDate && firingDate > new Date(endDate)) return false;

      if (minReached) {
        const min = Number(minReached);
        if (Number.isFinite(min)) {
          if (!firing.tempReached || firing.tempReached < min) return false;
        }
      }

      if (maxReached) {
        const max = Number(maxReached);
        if (Number.isFinite(max)) {
          if (!firing.tempReached || firing.tempReached > max) return false;
        }
      }

      return true;
    });
  }, [endDate, firingHistory, maxReached, minReached, selectedCone, selectedKiln, startDate]);

  const clearFilters = () => {
    setSelectedKiln("all");
    setSelectedCone("all");
    setMinReached("");
    setMaxReached("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 pb-12">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
              Kiln Tracker
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Firing dashboard</h1>
                <p className="mt-1 text-base text-gray-700">
                  Jump into open firings or review your firing history.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-purple-800 ring-1 ring-purple-200 transition hover:bg-purple-50"
              >
                ← Back to home
              </Link>
            </div>
          </div>
          <Link
            href="/firings/new"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
          >
            Start new firing
          </Link>
        </header>

        <section className="grid gap-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Open firings</h2>
              <p className="text-sm text-gray-600">Quick links to active logs.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {openFirings.map((firing) => (
              <Link
                key={firing.id}
                href={`/firings/${firing.id}`}
                className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-purple-700">{firing.kilnName}</p>
                  <h3 className="text-lg font-bold text-gray-900">Cone {firing.targetCone}</h3>
                  <p className="text-sm text-gray-700">
                    Target {firing.targetTemp ? `${firing.targetTemp}°F` : "—"}
                  </p>
                  <p className="text-xs text-gray-500">Started {formatDateTime(firing.startedAt)}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800 ring-2 ring-purple-200">
                  {firing.status}
                </div>
              </Link>
            ))}
            {openFirings.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-purple-50/60 p-6 text-center text-sm text-gray-600">
                No open firings right now. Start one to begin logging.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Firing history</h2>
              <p className="text-sm text-gray-600">Click into any firing to review logs, photos, and pieces.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
              >
                <span aria-hidden>⏷</span>
                Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
          {isFilterOpen && (
            <div className="grid gap-4 rounded-2xl border border-purple-100 bg-white/80 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1 text-sm font-medium text-gray-800">
                Kiln
                <select
                  id="kiln-filter"
                  value={selectedKiln}
                  onChange={(event) => setSelectedKiln(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="all">All kilns</option>
                  {kilnOptions.map((kiln) => (
                    <option key={kiln} value={kiln}>
                      {kiln}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-800">
                Target cone
                <select
                  value={selectedCone}
                  onChange={(event) => setSelectedCone(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="all">All cones</option>
                  {coneOptions.map((cone) => (
                    <option key={cone} value={cone}>
                      Cone {cone}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2 rounded-xl bg-purple-50/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Date range</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Start
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    End
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2 rounded-xl bg-purple-50/60 p-3 md:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Temp reached (°F)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Min
                    <input
                      type="number"
                      inputMode="numeric"
                      value={minReached}
                      onChange={(event) => setMinReached(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Max
                    <input
                      type="number"
                      inputMode="numeric"
                      value={maxReached}
                      onChange={(event) => setMaxReached(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-hidden rounded-3xl bg-white/90 shadow-lg ring-1 ring-purple-100">
            <table className="min-w-full divide-y divide-purple-100">
              <thead className="bg-purple-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Kiln
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Target Cone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Target Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Temp Reached
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/70">
                {filteredHistory.map((firing) => (
                  <tr key={firing.id} className="hover:bg-purple-50/60">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(firing.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{firing.kiln}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">Cone {firing.targetCone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {firing.targetTemp ? `${firing.targetTemp}°F` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {firing.tempReached ? `${firing.tempReached}°F` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/firings/${firing.id}`}
                        className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
