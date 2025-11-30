'use client';

import React, { useState } from "react";

// TODO: replace with trpc.glazes.list and trpc.clayBodies.list
const initialGlazes = [
  { id: "g1", name: "Fog", brand: "A" },
  { id: "g2", name: "Seaweed", brand: "B" },
];
const initialClayBodies = [
  { id: "c1", name: "B-Mix" },
  { id: "c2", name: "Speckled Stoneware" },
];

export default function MaterialsPage() {
  const [glazes, setGlazes] = useState(initialGlazes);
  const [clayBodies, setClayBodies] = useState(initialClayBodies);
  const [glazeForm, setGlazeForm] = useState({ name: "", brand: "", color: "", coneRange: "", notes: "" });
  const [clayForm, setClayForm] = useState({ name: "", bisqueTemp: "", notes: "" });

  const addGlaze = () => {
    setGlazes((prev) => [...prev, { id: `g${prev.length + 1}`, name: glazeForm.name, brand: glazeForm.brand }]);
  };

  const addClay = () => {
    setClayBodies((prev) => [...prev, { id: `c${prev.length + 1}`, name: clayForm.name }]);
  };

  return (
    <main className="p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Materials Library</h1>
        <p className="text-sm text-gray-600">Manage glazes and clay bodies.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Glazes</h2>
        <div className="grid gap-2">
          {glazes.map((glaze) => (
            <div key={glaze.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{glaze.name}</div>
                <div className="text-sm text-gray-600">Brand: {glaze.brand || "—"}</div>
              </div>
              {/* TODO: edit/delete actions */}
            </div>
          ))}
        </div>

        <div className="space-y-2 border rounded p-3">
          <h3 className="font-semibold">Add Glaze</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-2 py-1"
              placeholder="Name"
              value={glazeForm.name}
              onChange={(e) => setGlazeForm({ ...glazeForm, name: e.target.value })}
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Brand"
              value={glazeForm.brand}
              onChange={(e) => setGlazeForm({ ...glazeForm, brand: e.target.value })}
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Color"
              value={glazeForm.color}
              onChange={(e) => setGlazeForm({ ...glazeForm, color: e.target.value })}
            />
            <input
              className="border rounded px-2 py-1"
              placeholder="Cone Range"
              value={glazeForm.coneRange}
              onChange={(e) => setGlazeForm({ ...glazeForm, coneRange: e.target.value })}
            />
          </div>
          <textarea
            className="border rounded px-2 py-1 w-full"
            placeholder="Notes"
            value={glazeForm.notes}
            onChange={(e) => setGlazeForm({ ...glazeForm, notes: e.target.value })}
            rows={2}
          />
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={addGlaze}
          >
            Save Glaze
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Clay Bodies</h2>
        <div className="grid gap-2">
          {clayBodies.map((clay) => (
            <div key={clay.id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{clay.name}</div>
                <div className="text-sm text-gray-600">Bisque Temp: {clay.bisqueTemp ?? "—"}</div>
              </div>
              {/* TODO: edit/delete actions */}
            </div>
          ))}
        </div>

        <div className="space-y-2 border rounded p-3">
          <h3 className="font-semibold">Add Clay Body</h3>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Name"
            value={clayForm.name}
            onChange={(e) => setClayForm({ ...clayForm, name: e.target.value })}
          />
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            placeholder="Typical Bisque Temp"
            value={clayForm.bisqueTemp}
            onChange={(e) => setClayForm({ ...clayForm, bisqueTemp: e.target.value })}
          />
          <textarea
            className="border rounded px-2 py-1 w-full"
            placeholder="Notes"
            value={clayForm.notes}
            onChange={(e) => setClayForm({ ...clayForm, notes: e.target.value })}
            rows={2}
          />
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={addClay}
          >
            Save Clay Body
          </button>
        </div>
      </section>
    </main>
  );
}
