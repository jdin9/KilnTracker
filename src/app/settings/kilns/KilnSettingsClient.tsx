'use client';

import React, { useState } from "react";

// TODO: replace with trpc.kilns.list/useMutations
const mockKilns = [
  { id: "k1", name: "Big Manual Kiln", controlType: "manual_switches", numSwitches: 4 },
  { id: "k2", name: "Tiny Test Kiln", controlType: "manual_dial", numSwitches: null },
];

export default function KilnSettingsPage() {
  const [kilns, setKilns] = useState(mockKilns);
  const [form, setForm] = useState({
    name: "",
    controlType: "manual_switches",
    numSwitches: "",
    notes: "",
  });

  const addKiln = () => {
    setKilns((prev) => [
      ...prev,
      {
        id: `k${prev.length + 1}`,
        name: form.name,
        controlType: form.controlType,
        numSwitches: form.controlType === "manual_switches" ? Number(form.numSwitches) : null,
      },
    ]);
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kilns & Maintenance</h1>
        <p className="text-sm text-gray-600">
          Manage kiln definitions and maintenance notes. TODO: wire up to backend.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Kilns</h2>
        <div className="grid gap-2">
          {kilns.map((kiln) => (
            <div key={kiln.id} className="border rounded p-3">
              <div className="font-medium">{kiln.name}</div>
              <div className="text-sm text-gray-600">
                {kiln.controlType} • switches: {kiln.numSwitches ?? "n/a"}
              </div>
              {/* TODO: maintenance notes list and add form */}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Add / Edit Kiln</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Name</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Control Type</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={form.controlType}
              onChange={(e) => setForm({ ...form, controlType: e.target.value })}
            >
              <option value="manual_switches">Manual Switches</option>
              <option value="manual_dial">Manual Dial</option>
            </select>
          </div>
          {form.controlType === "manual_switches" && (
            <div className="space-y-1">
              <label className="block text-sm font-medium">Number of Switches</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={form.numSwitches}
                onChange={(e) => setForm({ ...form, numSwitches: e.target.value })}
              />
            </div>
          )}
          <div className="col-span-2 space-y-1">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="border rounded px-2 py-1 w-full"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={addKiln}
        >
          Save Kiln
        </button>
      </section>
    </main>
  );
}
