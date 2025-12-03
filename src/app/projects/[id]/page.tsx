import React from "react";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/dateFormat";

// TODO: replace with trpc.project.detail.useQuery
const mockProject = {
  id: "p1",
  title: "Vase",
  clayBody: "B-Mix",
  makerName: "Alex",
  notes: "Example project notes.",
  coverUrl: null as string | null,
  steps: [
    {
      id: "s1",
      type: "glaze",
      glazeName: "Fog",
      numCoats: 2,
      applicationMethod: "dip",
      patternDescription: "full dip",
      notes: "",
      photos: [],
    },
    {
      id: "s2",
      type: "firing",
      firingId: "1",
      cone: "6",
      peakTemp: 1825,
      firingDate: new Date().toISOString(),
      photos: [],
    },
  ],
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  // const { data, isLoading } = trpc.project.detail.useQuery({ id: params.id });
  const data = mockProject;

  if (!data) return notFound();

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-2">
        {data.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.coverUrl}
            alt={`${data.title} cover`}
            className="w-full max-h-80 object-cover rounded"
          />
        )}
        <h1 className="text-2xl font-bold">{data.title || "Untitled Project"}</h1>
        <p className="text-sm text-gray-600">Clay Body: {data.clayBody}</p>
        <p className="text-sm text-gray-600">Maker: {data.makerName}</p>
        {data.notes && <p className="text-sm text-gray-700">Notes: {data.notes}</p>}
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Steps</h2>
        <div className="space-y-3">
          {data.steps.map((step, idx) => (
            <div key={step.id} className="border rounded p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  Step {idx + 1}: {step.type === "glaze" ? "Glaze" : "Firing"}
                </div>
                {step.type === "firing" && step.firingId && (
                  <a
                    href={`/firings/${step.firingId}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View firing
                  </a>
                )}
              </div>

              {step.type === "glaze" ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Glaze: {step.glazeName}</div>
                  <div>Coats: {step.numCoats}</div>
                  <div>Application: {step.applicationMethod}</div>
                  <div>Pattern: {step.patternDescription}</div>
                  {step.notes && <div>Notes: {step.notes}</div>}
                </div>
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Cone: {step.cone || "—"}</div>
                  <div>Peak Temp: {step.peakTemp ?? "—"}</div>
                  <div>Date: {step.firingDate ? formatDate(step.firingDate) : "—"}</div>
                </div>
              )}

              {step.photos?.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {step.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Step photo"
                      className="h-24 w-full object-cover rounded"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No photos</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
