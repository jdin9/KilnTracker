'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
    bisqueTemp: "",
    title: "",
    makerName: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createProject.mutateAsync({
      clay_body_id: form.clayBodyId,
      has_been_bisque: form.hasBeenBisque,
      bisque_temp: form.bisqueTemp ? Number(form.bisqueTemp) : undefined,
      title: form.title || undefined,
      maker_name: form.makerName || undefined,
      notes: form.notes || undefined,
    });
    router.push(`/projects/${res.id}`);
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-sm text-gray-600">Create a glaze project.</p>
      </header>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium">Clay Body</label>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Clay body ID"
            value={form.clayBodyId}
            onChange={(e) => setForm({ ...form, clayBodyId: e.target.value })}
          />
          <p className="text-xs text-gray-500">TODO: select from library</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.hasBeenBisque}
            onChange={(e) => setForm({ ...form, hasBeenBisque: e.target.checked })}
          />
          <label className="text-sm">Has been bisque fired</label>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Bisque Temp (optional)</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={form.bisqueTemp}
            onChange={(e) => setForm({ ...form, bisqueTemp: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Title</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Maker Name</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={form.makerName}
            onChange={(e) => setForm({ ...form, makerName: e.target.value })}
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
          Create Project
        </button>
      </form>
    </main>
  );
}
