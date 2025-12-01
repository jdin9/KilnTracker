'use client';

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// TODO: replace with real tRPC mutation (e.g., trpc.firing.create.useMutation)
const useCreateFiring = () => ({
  mutateAsync: async (input: any) => {
    console.log("Create firing", input);
    return { id: `firing-${Date.now()}` };
  },
});

const kilnOptions = [
  { id: "k1", name: "Big Manual Kiln", model: "Skutt KM1227", location: "Studio North" },
  { id: "k2", name: "Studio Test Kiln", model: "Manual Dial", location: "Studio Annex" },
  { id: "k3", name: "Electric Kiln", model: "Olympic", location: "Studio Back" },
];

const coneOptions = ["022", "018", "06", "05", "04", "03", "02", "01", "1", "2", "4", "5", "6", "8", "10"];

const fillLevels = [
  { value: "sparse", label: "Sparse" },
  { value: "half", label: "Half full" },
  { value: "full", label: "Full" },
];

const toLocalDateTime = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function NewFiringPage() {
  const router = useRouter();
  const createFiring = useCreateFiring();

  const [form, setForm] = useState({
    kilnId: kilnOptions[0]?.id ?? "",
    firingType: "bisque",
    targetCone: coneOptions[5],
    fillLevel: fillLevels[0].value,
    startTime: toLocalDateTime(new Date()),
    outsideTempStart: "",
    notes: "",
    loadPhotos: [] as File[],
  });

  const coneChoices = useMemo(() => coneOptions, []);

  const persistOpenFiring = (payload: any) => {
    if (typeof window === "undefined") return;
    const kiln = kilnOptions.find((k) => k.id === form.kilnId);
    const existing = window.localStorage.getItem("kiln-open-firings");
    const parsed = existing ? JSON.parse(existing) : [];
    const detailStoreRaw = window.localStorage.getItem("kiln-open-firing-details");
    const detailsStore = detailStoreRaw ? JSON.parse(detailStoreRaw) : {};

    const openFiringEntry = {
      id: payload.id,
      kilnName: kiln?.name ?? "Unknown kiln",
      status: "Started",
      targetCone: payload.target_cone,
      targetTemp: payload.target_temp ?? 0,
      startedAt: payload.start_time,
    };

    const firingDetail = {
      id: payload.id,
      kilnName: kiln?.name ?? "Unknown kiln",
      kilnModel: kiln?.model ?? "Manual kiln",
      location: kiln?.location ?? "Studio",
      firingType: form.firingType,
      status: "open",
      targetCone: payload.target_cone,
      targetTemp: payload.target_temp ?? undefined,
      startTime: payload.start_time,
      loadPhotos: form.loadPhotos.map((file) => file.name),
      notes: form.notes || undefined,
    };

    window.localStorage.setItem(
      "kiln-open-firings",
      JSON.stringify([...parsed, openFiringEntry]),
    );

    window.localStorage.setItem(
      "kiln-open-firing-details",
      JSON.stringify({
        ...detailsStore,
        [payload.id]: firingDetail,
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createFiring.mutateAsync({
      kiln_id: form.kilnId,
      firing_type: form.firingType,
      target_cone: form.targetCone,
      target_temp: undefined,
      fill_level: form.fillLevel,
      outside_temp_start: form.outsideTempStart ? Number(form.outsideTempStart) : undefined,
      start_time: new Date(form.startTime).toISOString(),
      load_photos: form.loadPhotos.map((file) => file.name),
      notes: form.notes || undefined,
    });

    persistOpenFiring({
      id: res.id,
      target_cone: form.targetCone,
      target_temp: undefined,
      start_time: new Date(form.startTime).toISOString(),
    });

    router.push(`/firings/${res.id}`);
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Start a New Firing</h1>
        <p className="text-sm text-gray-600">Set up the kiln, cone, and start time before logging activity.</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Kiln</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.kilnId}
            onChange={(e) => setForm({ ...form, kilnId: e.target.value })}
          >
            {kilnOptions.map((kiln) => (
              <option key={kiln.id} value={kiln.id}>
                {kiln.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Kilns pulled from admin kiln settings.</p>
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
          <select
            className="border rounded px-2 py-1 w-full"
            value={form.targetCone}
            onChange={(e) => setForm({ ...form, targetCone: e.target.value })}
          >
            {coneChoices.map((cone) => (
              <option key={cone} value={cone}>
                Cone {cone}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Pulled from admin cone list.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-sm font-medium">Fill level</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={form.fillLevel}
              onChange={(e) => setForm({ ...form, fillLevel: e.target.value })}
            >
              {fillLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Sparse, half full, or full loads help plan the firing curve.</p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium">Start time</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 w-full"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500">Defaults to now but can be edited.</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Load photos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setForm({ ...form, loadPhotos: Array.from(e.target.files ?? []) })}
            className="w-full"
          />
          <p className="text-xs text-gray-500">Optional photos of the kiln load to reference later.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
