"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { initialClayBodies } from "@/lib/clayBodies";
import { coneChart } from "@/lib/coneReference";
import { initialUsers } from "@/lib/users";
import { saveStoredProject } from "@/lib/projectStorage";

// TODO: replace with trpc.project.create.useMutation
const useCreateProject = () => ({
  mutateAsync: async (input: any) => {
    console.log("Create project", input);
    return { id: input.id };
  },
});

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [form, setForm] = useState({
    clayBodyId: "",
    bisqueCone: "",
    title: "",
    makerName: "",
    notes: "",
  });
  const [initialPhotos, setInitialPhotos] = useState<{ name: string; url: string }[]>([]);

  const clayBodyOptions = useMemo(() => initialClayBodies, []);
  const bisqueConeOptions = useMemo(() => coneChart, []);
  const makerOptions = useMemo(
    () => initialUsers.map((user) => ({ ...user, fullName: `${user.firstName} ${user.lastName}` })),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createProject.mutateAsync({
      id: `proj-${Date.now()}`,
      clay_body_id: form.clayBodyId,
      bisque_temp: form.bisqueCone
        ? bisqueConeOptions.find((entry) => entry.cone === form.bisqueCone)?.temperatureF
        : undefined,
      title: form.title || undefined,
      maker_name: form.makerName || undefined,
      notes: form.notes || undefined,
    });
    const initialPhotoEntries = initialPhotos.map((photo, index) => ({
      id: `project-photo-${Date.now()}-${index}`,
      name: photo.name,
      url: photo.url,
    }));
    saveStoredProject({
      id: res.id,
      title: form.title || "Untitled Project",
      clayBody:
        clayBodyOptions.find((clayBody) => String(clayBody.id) === form.clayBodyId)?.name || "Unknown clay body",
      makerName: form.makerName || "Unassigned",
      createdAt: new Date().toISOString(),
      notes: form.notes || undefined,
      bisqueTemp: form.bisqueCone
        ? bisqueConeOptions.find((entry) => entry.cone === form.bisqueCone)?.temperatureF
        : undefined,
      photos: initialPhotoEntries,
      coverPhoto: initialPhotoEntries[0],
      glazes: [],
      steps: [],
    });
    router.push(`/projects/${res.id}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Pottery tracker</p>
            <h1 className="text-3xl font-bold text-gray-900">Add a new project</h1>
            <p className="text-sm text-gray-600">
              Capture clay, firings, and maker details so the whole studio stays in sync.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow"
          >
            ← Back to projects
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <form
            className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Clay body</label>
                <select
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  value={form.clayBodyId}
                  onChange={(e) => setForm({ ...form, clayBodyId: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Choose a clay body
                  </option>
                  {clayBodyOptions.map((clayBody) => (
                    <option key={clayBody.id} value={String(clayBody.id)}>
                      {clayBody.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Bisque temperature</label>
                <select
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  value={form.bisqueCone}
                  onChange={(e) => setForm({ ...form, bisqueCone: e.target.value })}
                >
                  <option value="">No bisque firing yet</option>
                  {bisqueConeOptions.map((entry) => (
                    <option key={entry.cone} value={entry.cone}>
                      Cone {entry.cone} ({entry.temperatureF}°F)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Title</label>
                <input
                  className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Carved vase set"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Maker</label>
                <select
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                  value={form.makerName}
                  onChange={(e) => setForm({ ...form, makerName: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {makerOptions.map((maker) => (
                    <option key={maker.id} value={maker.fullName}>
                      {maker.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Notes</label>
              <textarea
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                placeholder="Surface plans, firing reminders, or key glaze combos"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Save now to add glaze steps and kiln firings later.
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-purple-700"
              >
                Create project
              </button>
            </div>
          </form>

          <aside className="space-y-4 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">Image Upload</p>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Preview</span>
            </div>

            <div className="space-y-2 rounded-2xl border border-dashed border-white/50 bg-white/5 p-4">
              <label
                htmlFor="firing-photos"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow hover:bg-purple-50"
              >
                Upload project photos
              </label>
              <input
                id="firing-photos"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const previews = files.map((file) => ({
                    name: file.name,
                    url: URL.createObjectURL(file),
                  }));
                  setInitialPhotos(previews);
                }}
              />

              {initialPhotos.length > 0 ? (
                <div className="space-y-2 text-xs text-purple-100">
                  <p className="font-semibold">Selected {initialPhotos.length} image(s):</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {initialPhotos.map((photo) => (
                      <div key={photo.name} className="flex flex-col items-center gap-1">
                        <div className="overflow-hidden rounded-lg border border-white/40 bg-white/10 p-1">
                          <Image
                            src={photo.url}
                            alt={photo.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        </div>
                        <span className="w-20 text-center text-[11px] leading-tight text-purple-50 break-words">
                          {photo.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-purple-100">No images selected yet.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
