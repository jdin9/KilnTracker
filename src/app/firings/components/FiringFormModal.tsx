'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ADMIN_KILNS_KEY, loadAdminKilns } from "@/lib/adminStorage";
import { getConeTemperature } from "@/lib/coneReference";

// TODO: replace with real tRPC mutation (e.g., trpc.firing.create.useMutation)
const useCreateFiring = () => ({
  mutateAsync: async (input: any) => {
    console.log("Create firing", input);
    return { id: `firing-${Date.now()}` };
  },
});

type FiringFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "update";
  initialData?: Partial<{
    kilnId: string;
    firingType: string;
    targetCone: string;
    fillLevel: string;
    startTime: string;
    outsideTempStart: string;
    notes: string;
  }>;
};

type KilnOption = { id: string; name: string; model: string; location: string };
type AdminKiln = {
  id?: number;
  nickname?: string;
  type?: "manual" | "digital";
  manualControl?: "switches" | "dial";
  location?: string;
};

const defaultKilnOptions: KilnOption[] = [];

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

const badgeStyles = {
  create: "bg-blue-100 text-blue-600",
  update: "bg-amber-100 text-amber-700",
};

const safePersist = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Unable to persist ${key} to localStorage`, error);
    try {
      window.sessionStorage.setItem(key, value);
    } catch (sessionError) {
      console.warn(`Unable to persist ${key} to sessionStorage`, sessionError);
    }
  }
};

export function FiringFormModal({ open, onClose, mode = "create", initialData }: FiringFormModalProps) {
  const router = useRouter();
  const createFiring = useCreateFiring();

  const [kilnOptions, setKilnOptions] = useState<KilnOption[]>(defaultKilnOptions);

  useEffect(() => {
    let isMounted = true;

    const mapKilnsToOptions = (kilns: AdminKiln[]): KilnOption[] =>
      kilns.map((kiln, index) => ({
        id: kiln.id ? kiln.id.toString() : `kiln-${index + 1}`,
        name: kiln.nickname ?? "Unnamed kiln",
        model:
          kiln.type === "digital"
            ? "Digital controller"
            : kiln.manualControl === "switches"
              ? "Manual switches kiln"
              : "Manual dial kiln",
        location: kiln.location ?? "Studio",
      }));

    const loadKilns = async () => {
      const storedKilns = await loadAdminKilns<AdminKiln>([]);
      if (!isMounted) return;
      setKilnOptions(mapKilnsToOptions(storedKilns));
    };

    void loadKilns();

    const handleStorageUpdate = async (event: StorageEvent) => {
      if (event.key && event.key !== ADMIN_KILNS_KEY) return;
      const latestKilns = await loadAdminKilns<AdminKiln>([]);
      if (!isMounted) return;
      setKilnOptions(mapKilnsToOptions(latestKilns));
    };

    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const [form, setForm] = useState({
    kilnId: initialData?.kilnId ?? defaultKilnOptions[0]?.id ?? "",
    firingType: initialData?.firingType ?? "bisque",
    targetCone: initialData?.targetCone ?? coneOptions[5],
    fillLevel: initialData?.fillLevel ?? fillLevels[0].value,
    startTime: initialData?.startTime ?? toLocalDateTime(new Date()),
    outsideTempStart: initialData?.outsideTempStart ?? "",
    notes: initialData?.notes ?? "",
  });

  const coneChoices = useMemo(() => coneOptions, []);

  useEffect(() => {
    if (!kilnOptions.length) return;
    setForm((prev) => {
      if (prev.kilnId && kilnOptions.some((kiln) => kiln.id === prev.kilnId)) {
        return prev;
      }
      return { ...prev, kilnId: kilnOptions[0].id };
    });
  }, [kilnOptions]);

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
      targetTemp: payload.target_temp,
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
      notes: form.notes || undefined,
    };

    safePersist(
      "kiln-open-firings",
      JSON.stringify([...parsed, openFiringEntry]),
    );

    safePersist(
      "kiln-open-firing-details",
      JSON.stringify({
        ...detailsStore,
        [payload.id]: firingDetail,
      }),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetTemp = getConeTemperature(form.targetCone);
    const res = await createFiring.mutateAsync({
      kiln_id: form.kilnId,
      firing_type: form.firingType,
      target_cone: form.targetCone,
      target_temp: targetTemp,
      fill_level: form.fillLevel,
      outside_temp_start: form.outsideTempStart ? Number(form.outsideTempStart) : undefined,
      start_time: new Date(form.startTime).toISOString(),
      notes: form.notes || undefined,
    });

    persistOpenFiring({
      id: res.id,
      target_cone: form.targetCone,
      target_temp: targetTemp,
      start_time: new Date(form.startTime).toISOString(),
    });

    onClose();
    router.push(`/firings/${res.id}`);
  };

  const closeModal = () => {
    setForm((prev) => ({ ...prev }));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-amber-50" aria-hidden />
        <div className="relative flex items-start justify-between p-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[mode]}`}>
              {mode === "create" ? "Start new firing" : "Update firing"}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {mode === "create" ? "Log a kiln firing" : "Edit firing details"}
            </h2>
            <p className="text-sm text-slate-600">
              Capture kiln setup, targets, and notes without leaving your current view.
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:shadow"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="relative grid gap-6 border-t border-slate-200 bg-white/80 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900">Kiln</label>
                <span className="text-xs text-slate-500">from kiln list</span>
              </div>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.kilnId}
                onChange={(e) => setForm({ ...form, kilnId: e.target.value })}
              >
                {kilnOptions.map((kiln) => (
                  <option key={kiln.id} value={kiln.id}>
                    {kiln.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Model and location are recorded automatically.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="text-sm font-medium text-slate-900">Firing type</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.firingType}
                  onChange={(e) => setForm({ ...form, firingType: e.target.value })}
                >
                  <option value="bisque">Bisque</option>
                  <option value="glaze">Glaze</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="text-sm font-medium text-slate-900">Target cone</label>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.targetCone}
                  onChange={(e) => setForm({ ...form, targetCone: e.target.value })}
                >
                  {coneChoices.map((cone) => (
                    <option key={cone} value={cone}>
                      Cone {cone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-medium text-slate-900">Fill level</label>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.fillLevel}
                onChange={(e) => setForm({ ...form, fillLevel: e.target.value })}
              >
                {fillLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Gauge how dense the chamber is before you start.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="text-sm font-medium text-slate-900">Start time</label>
                <input
                  type="datetime-local"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">Defaults to now; adjust if backfilling history.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <label className="text-sm font-medium text-slate-900">Outside temp at start</label>
                <input
                  type="number"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.outsideTempStart}
                  onChange={(e) => setForm({ ...form, outsideTempStart: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">Optional but helpful for comparing firing curves.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-900">Notes</label>
                <span className="text-xs text-slate-500">prep, clay body, glazes</span>
              </div>
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
              />
            </div>

              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-inner">
              <div>
                <div className="font-medium">Ready to {mode === "create" ? "start" : "save"}?</div>
                <p className="text-xs text-blue-800">We’ll save this firing and take you to the activity timeline.</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {mode === "create" ? "Start firing" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
