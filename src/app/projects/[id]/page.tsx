"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

import { formatDate } from "@/lib/dateFormat";
import { coneChart, getConeTemperature } from "@/lib/coneReference";
import { getActiveStudioColors, initialStudioColors } from "@/lib/studioColors";
import { loadAdminStudioColors } from "@/lib/adminStorage";
import {
  loadStoredProjects,
  deleteStoredProject,
  saveStoredProject,
  StoredProject,
  type StoredProjectPhoto,
} from "@/lib/projectStorage";

const collectProjectGlazes = (project: StoredProject) => {
  const glazesFromSteps = (project.steps || [])
    .filter((step: any) => step.type === "glaze" && step.glazeName)
    .map((step: any) => step.glazeName as string);

  const combined = [...(project.glazes || []), ...glazesFromSteps].filter(Boolean);
  return Array.from(new Set(combined));
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<StoredProject | null | "loading">("loading");
  const [activityType, setActivityType] = useState<"glaze" | "fire">("glaze");
  const [glazeColor, setGlazeColor] = useState("");
  const [glazeCoats, setGlazeCoats] = useState("1");
  const [glazeNotes, setGlazeNotes] = useState("");
  const [firingCone, setFiringCone] = useState("");
  const [firingNotes, setFiringNotes] = useState("");
  const [activityPhotos, setActivityPhotos] = useState<File[]>([]);
  const [photoInputKey, setPhotoInputKey] = useState(0);

  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [studioColors, setStudioColors] = useState(initialStudioColors);
  const activeColors = useMemo(() => getActiveStudioColors(studioColors), [studioColors]);

  useEffect(() => {
    let isMounted = true;

    const loadStudioColors = async () => {
      const storedStudioColors = await loadAdminStudioColors(initialStudioColors);
      if (isMounted) setStudioColors(storedStudioColors);
    };

    void loadStudioColors();

    const handleStorageUpdate = () => {
      void loadStudioColors();
    };

    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      const projects = await loadStoredProjects();
      if (!isMounted) return;
      setStoredProjects(projects);
      setProjectsLoaded(true);
    };

    void loadProjects();

    const handleStorageUpdate = () => {
      void loadProjects();
    };

    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (!projectsLoaded) return;

    const storedMatch = storedProjects.find((project) => project.id === params.id);

    if (storedMatch) {
      setData({ ...storedMatch, glazes: collectProjectGlazes(storedMatch) });
      return;
    }

    setData(null);
  }, [params.id, projectsLoaded, storedProjects]);

  const handleDeleteProject = async () => {
    if (!data || data === "loading") return;

    const confirmDelete = window.confirm("Delete this project and all of its steps?");
    if (!confirmDelete) return;

    await deleteStoredProject(data.id);

    router.push("/projects");
  };

  const handleAddActivity = (event: React.FormEvent) => {
    event.preventDefault();
    if (!data || data === "loading") return;

    if (activityType === "glaze" && !glazeColor) {
      return;
    }

    if (activityType === "fire" && !firingCone) {
      return;
    }

    const photoEntries = activityPhotos.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    const newStep =
      activityType === "glaze"
        ? {
            id: `step-${Date.now()}`,
            type: "glaze" as const,
            glazeName: glazeColor,
            numCoats: Number(glazeCoats) || 0,
            applicationMethod: "unspecified",
            patternDescription: "",
            notes: glazeNotes || undefined,
            photos: photoEntries,
          }
        : {
            id: `step-${Date.now()}`,
            type: "firing" as const,
            firingId: undefined,
            cone: firingCone,
            peakTemp: getConeTemperature(firingCone),
            firingDate: new Date().toISOString(),
            notes: firingNotes || undefined,
            photos: photoEntries,
          };

    setData((prev) => {
      if (!prev || prev === "loading") return prev;
      const updatedSteps = [...prev.steps, newStep];
      const updated = {
        ...prev,
        steps: updatedSteps,
        glazes: collectProjectGlazes({ ...prev, steps: updatedSteps }),
      };
      void saveStoredProject(updated);
      return updated;
    });

    if (activityType === "glaze") {
      setGlazeColor("");
      setGlazeCoats("1");
      setGlazeNotes("");
    } else {
      setFiringCone("");
      setFiringNotes("");
    }

    setActivityPhotos([]);
    setPhotoInputKey((prev) => prev + 1);
  };

  if (data === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <p className="text-sm text-gray-600">Loading project…</p>
        </div>
      </main>
    );
  }

  if (!data) return notFound();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Project overview</p>
            <h1 className="text-3xl font-bold text-gray-900">{data.title || "Untitled Project"}</h1>
            <p className="text-sm text-gray-600">Track clay, firings, and glaze passes from start to finish.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteProject}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow"
            >
              Delete project
            </button>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow"
            >
              ← Back to projects
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">{data.clayBody}</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
                Maker: {data.makerName || "Unassigned"}
              </span>
              {collectProjectGlazes(data).map((glaze) => (
                <span
                  key={glaze}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {glaze}
                </span>
              ))}
              {data.notes && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">Notes added</span>
              )}
            </div>

            {data.notes && (
              <div className="rounded-2xl bg-purple-50 px-4 py-3 text-sm text-gray-800">
                <p className="font-semibold text-purple-900">Project notes</p>
                <p className="mt-1 leading-relaxed text-gray-700">{data.notes}</p>
              </div>
            )}

            {data.photos?.length ? (
              <div className="space-y-2 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Project photos</h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                    {data.photos.length} image{data.photos.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {data.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.name}
                      className="h-32 w-full rounded-lg object-cover shadow-sm"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Process timeline</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-purple-700">{data.steps.length} steps</span>
              </div>

              <div className="space-y-3">
                {data.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="rounded-2xl border border-purple-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {step.type === "glaze" ? "Glaze application" : "Kiln firing"}
                          </p>
                          <p className="text-xs text-gray-600">{step.type === "glaze" ? "Surface pass" : "Firing log"}</p>
                        </div>
                      </div>

                      {step.type === "firing" && step.firingId && (
                        <Link
                          href={`/firings/${step.firingId}`}
                          className="text-sm font-semibold text-purple-700 transition hover:text-purple-900"
                        >
                          View firing →
                        </Link>
                      )}
                    </div>

                    {step.type === "glaze" ? (
                      <div className="mt-3 grid gap-2 text-sm text-gray-800 md:grid-cols-2">
                        <div className="rounded-xl bg-purple-50 px-3 py-2">
                          <p className="text-xs font-semibold text-purple-800">Glaze</p>
                          <p className="font-medium">{step.glazeName || "Unspecified glaze"}</p>
                        </div>
                        <div className="rounded-xl bg-purple-50 px-3 py-2">
                          <p className="text-xs font-semibold text-purple-800">Coats</p>
                          <p className="font-medium">{step.numCoats}</p>
                        </div>
                        {step.notes && (
                          <div className="md:col-span-2 rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-xs font-semibold text-gray-700">Notes</p>
                            <p className="text-gray-800">{step.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-2 text-sm text-gray-800 md:grid-cols-3">
                        <div className="rounded-xl bg-indigo-50 px-3 py-2">
                          <p className="text-xs font-semibold text-indigo-800">Cone</p>
                          <p className="font-medium">{step.cone || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 px-3 py-2">
                          <p className="text-xs font-semibold text-indigo-800">Peak temp</p>
                          <p className="font-medium">{step.peakTemp !== undefined ? `${step.peakTemp}°F` : "—"}</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 px-3 py-2">
                          <p className="text-xs font-semibold text-indigo-800">Date</p>
                          <p className="font-medium">{step.firingDate ? formatDate(step.firingDate) : "—"}</p>
                        </div>
                        {step.notes && (
                          <div className="md:col-span-3 rounded-xl bg-gray-50 px-3 py-2">
                            <p className="text-xs font-semibold text-gray-700">Notes</p>
                            <p className="text-gray-800">{step.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {step.photos?.length ? (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {step.photos.map((photo: StoredProjectPhoto) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={photo.id}
                            src={photo.url}
                            alt="Step photo"
                            className="h-24 w-full rounded object-cover"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">No photos yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-500 p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">Add activity</p>
                <h2 className="text-xl font-bold">Log a new step</h2>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Project</span>
            </div>

            <form className="space-y-4" onSubmit={handleAddActivity}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-purple-50">Activity</label>
                <select
                  className="w-full rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as "glaze" | "fire")}
                >
                  <option value="glaze" className="text-gray-900">
                    Glaze
                  </option>
                  <option value="fire" className="text-gray-900">
                    Fire
                  </option>
                </select>
              </div>

              {activityType === "glaze" ? (
                <div className="space-y-3 rounded-2xl border border-white/20 bg-white/5 p-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Photos</label>
                    <input
                      key={photoInputKey}
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full rounded-lg border border-dashed border-white/40 bg-white/5 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      onChange={(event) => setActivityPhotos(Array.from(event.target.files || []))}
                    />
                    <p className="text-[11px] text-purple-100">
                      {activityPhotos.length > 0
                        ? `${activityPhotos.length} image${activityPhotos.length > 1 ? "s" : ""} ready to attach`
                        : "Add surface reference shots or process photos."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Colour</label>
                    <select
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      value={glazeColor}
                      onChange={(e) => setGlazeColor(e.target.value)}
                      required
                    >
                      <option value="" className="text-gray-900">
                        Choose a colour
                      </option>
                      {activeColors.map((color) => (
                        <option key={color.id} value={color.name} className="text-gray-900">
                          {color.name} · {color.brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Coats</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      value={glazeCoats}
                      onChange={(e) => setGlazeCoats(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      value={glazeNotes}
                      onChange={(e) => setGlazeNotes(e.target.value)}
                      rows={3}
                      placeholder="Application method, pattern, or surface notes"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-white/20 bg-white/5 p-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Photos</label>
                    <input
                      key={photoInputKey}
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full rounded-lg border border-dashed border-white/40 bg-white/5 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      onChange={(event) => setActivityPhotos(Array.from(event.target.files || []))}
                    />
                    <p className="text-[11px] text-purple-100">
                      {activityPhotos.length > 0
                        ? `${activityPhotos.length} firing photo${activityPhotos.length > 1 ? "s" : ""} ready to attach`
                        : "Add kiln logs or witness cones for this firing."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Cone</label>
                    <select
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      value={firingCone}
                      onChange={(e) => setFiringCone(e.target.value)}
                      required
                    >
                      <option value="" className="text-gray-900">
                        Choose a cone
                      </option>
                      {coneChart.map((entry) => (
                        <option key={entry.cone} value={entry.cone} className="text-gray-900">
                          Cone {entry.cone} ({entry.temperatureF}°F)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-purple-100">Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white shadow-inner focus:border-white focus:outline-none"
                      value={firingNotes}
                      onChange={(e) => setFiringNotes(e.target.value)}
                      rows={3}
                      placeholder="Kiln location, soak time, or atmosphere"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow hover:-translate-y-0.5 hover:bg-purple-50"
              >
                Add activity to timeline
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
