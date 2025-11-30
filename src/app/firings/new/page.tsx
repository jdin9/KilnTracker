'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// TODO: replace with real tRPC mutation (e.g., trpc.firing.create.useMutation)
const useCreateFiring = () => ({
  mutateAsync: async (input: any) => {
    console.log("Create firing", input);
    return { id: "new-id" };
  },
});

export default function NewFiringPage() {
  const router = useRouter();
  const createFiring = useCreateFiring();

  const [form, setForm] = useState({
    kilnId: "",
    firingType: "bisque",
    targetCone: "",
    fillLevel: "spread_out",
    outsideTempStart: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: validation
    const res = await createFiring.mutateAsync({
      kiln_id: form.kilnId,
      firing_type: form.firingType,
      target_cone: form.targetCone,
      fill_level: form.fillLevel,
      outside_temp_start: Number(form.outsideTempStart),
      notes: form.notes || undefined,
    });
    router.push(`/firings/${res.id}`);
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Start a New Firing</h1>
        <p className="text-sm text-gray-600">Create a firing setup.</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Kiln</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Kiln ID"
            value={form.kilnId}
            onChange={(e) => setForm({ ...form, kilnId: e.target.value })}
          />
          <p className="text-xs text-gray-500">TODO: use kiln selector</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Firing Type</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.firingType}
            onChange={(e) => setForm({ ...form, firingType: e.target.value })}
          >
            <option value="bisque">Bisque</option>
            <option value="glaze">Glaze</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Target Cone</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="e.g. 6"
            value={form.targetCone}
            onChange={(e) => setForm({ ...form, targetCone: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Fill Level</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.fillLevel}
            onChange={(e) => setForm({ ...form, fillLevel: e.target.value })}
          >
            <option value="spread_out">Spread out</option>
            <option value="moderately_full">Moderately full</option>
            <option value="very_full">Very full</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Outside Temp at Start</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={form.outsideTempStart}
            onChange={(e) => setForm({ ...form, outsideTempStart: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Start Firing
        </button>
      </form>
    </main>
  );
}
