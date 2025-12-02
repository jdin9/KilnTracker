'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiringFormModal } from "./components/FiringFormModal";

// TODO: replace with real tRPC hooks, e.g., useFiringHistory(filters)
const mockFirings = [
  {
    id: "1",
    kilnName: "Big Manual Kiln",
    firingType: "bisque",
    status: "completed",
    targetCone: "05",
    startTime: new Date().toISOString(),
    maxTemp: 1830,
  },
];

type Filters = {
  kilnId?: string;
  firingType?: string;
  status?: string;
  targetCone?: string;
  dateFrom?: string;
  dateTo?: string;
};

export default function FiringsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [showCreate, setShowCreate] = useState(false);

  // TODO: replace with data from useFiringHistory(filters)
  const filteredFirings = useMemo(() => mockFirings, []);

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firings</h1>
          <p className="text-sm text-gray-600">
            Filter and browse firing history.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          New Firing
        </button>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Kiln</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Kiln name or id"
            value={filters.kilnId || ""}
            onChange={(e) => handleChange("kilnId", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Firing Type</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.firingType || ""}
            onChange={(e) => handleChange("firingType", e.target.value)}
          >
            <option value="">All</option>
            <option value="bisque">Bisque</option>
            <option value="glaze">Glaze</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Status</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={filters.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="">All</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="aborted">Aborted</option>
            <option value="test">Test</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Target Cone</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="e.g. 6"
            value={filters.targetCone || ""}
            onChange={(e) => handleChange("targetCone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date From</label>
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            value={filters.dateFrom || ""}
            onChange={(e) => handleChange("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date To</label>
          <input
            type="date"
            className="border rounded px-2 py-1 w-full"
            value={filters.dateTo || ""}
            onChange={(e) => handleChange("dateTo", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        {filteredFirings.map((firing) => (
          <Link
            key={firing.id}
            href={`/firings/${firing.id}`}
            className="border rounded p-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div>
              <div className="font-medium">{firing.kilnName}</div>
              <div className="text-sm text-gray-600">
                {firing.firingType} • {firing.status}
              </div>
            </div>
            <div className="text-sm text-gray-700 text-right">
              <div>Target Cone: {firing.targetCone}</div>
              <div>Start: {new Date(firing.startTime).toLocaleString()}</div>
              <div>Max Temp: {firing.maxTemp ?? "—"}</div>
            </div>
          </Link>
        ))}
      </section>

      <FiringFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </main>
  );
}
