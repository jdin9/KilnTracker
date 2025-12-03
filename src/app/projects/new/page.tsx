'use client';

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { initialClayBodies } from "@/lib/clayBodies";
import { coneChart } from "@/lib/coneReference";
import { initialUsers } from "@/lib/users";

// TODO: replace with trpc.project.create.useMutation
const useCreateProject = () => ({
  mutateAsync: async (input: any) => {
    console.log("Create project", input);
    return { id: "new-project" };
  },
});

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();
  const [form, setForm] = useState({
    clayBodyId: "",
    hasBeenBisque: false,
    bisqueCone: "",
    title: "",
    makerName: "",
    notes: "",
  });
  const [projectFiles, setProjectFiles] = useState<File[]>([]);

  const clayBodyOptions = useMemo(() => initialClayBodies, []);
  const bisqueConeOptions = useMemo(() => coneChart, []);
  const makerOptions = useMemo(
    () => initialUsers.map((user) => ({ ...user, fullName: `${user.firstName} ${user.lastName}` })),
    []
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setProjectFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createProject.mutateAsync({
      clay_body_id: form.clayBodyId,
      has_been_bisque: form.hasBeenBisque,
      bisque_temp: form.bisqueCone
        ? bisqueConeOptions.find((entry) => entry.cone === form.bisqueCone)?.temperatureF
        : undefined,
      title: form.title || undefined,
      maker_name: form.makerName || undefined,
      notes: form.notes || undefined,
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
                <p className="text-xs text-gray-600">Select from your studio clay bodies.</p>
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
                <p className="text-xs text-gray-600">Pull cones directly from kiln settings.</p>
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

            <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3">
              <input
                id="bisque-status"
                type="checkbox"
                className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                checked={form.hasBeenBisque}
                onChange={(e) => setForm({ ...form, hasBeenBisque: e.target.checked })}
              />
              <label className="text-sm font-semibold text-purple-900" htmlFor="bisque-status">
                Project has been bisque fired
              </label>
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

          <aside className="space-y-4 rounded-3xl bg-white/95 p-6 shadow-lg ring-1 ring-purple-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Project files</p>
                <h2 className="text-xl font-bold text-gray-900">Upload references</h2>
                <p className="text-sm text-gray-600">Drop sketches, glaze tests, or inspiration to keep everything together.</p>
              </div>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">Images</span>
            </div>

            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/60 px-4 py-6 text-center text-sm text-purple-800 transition hover:border-purple-300 hover:bg-purple-50"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-purple-600 shadow-inner">📁</div>
              <div>
                <p className="font-semibold">Add images</p>
                <p className="text-xs text-purple-700">PNG, JPG up to 10MB each</p>
              </div>
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>File library</span>
                <span className="rounded-full bg-purple-50 px-2 py-1 text-[11px] text-purple-700">{projectFiles.length} file{projectFiles.length === 1 ? "" : "s"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                {projectFiles.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-500">
                    No files yet. Upload images to share kiln-ready context.
                  </div>
                )}
                {projectFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-purple-100 bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-lg text-purple-600">
                      🖼️
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-semibold text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
