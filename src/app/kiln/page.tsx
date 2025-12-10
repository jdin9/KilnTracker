'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { formatDate, formatDateTime } from "@/lib/dateFormat";
import { persistSharedJson, readSharedJson } from "@/lib/sharedJsonStorage";

type PhotoAsset = { name: string; src: string };

type OpenFiring = {
  id: string;
  kilnName: string;
  status: string;
  targetCone: string;
  targetTemp?: number;
  startedAt: string;
  loadPhotos?: (string | PhotoAsset)[];
  firstPhoto?: PhotoAsset;
};

type LoadedPiece = {
  name: string;
  notes?: string;
};

type FiringHistoryRow = {
  id: string;
  date: string;
  kiln: string;
  kilnModel?: string;
  location?: string;
  firingType?: string;
  targetCone: string;
  targetTemp?: number;
  tempReached?: number;
  status: string;
  loadPhotos?: (string | PhotoAsset)[];
  firstPhoto?: PhotoAsset;
  pieces?: LoadedPiece[];
  endTime?: string;
};

const palette = ["#a855f7", "#6366f1", "#f97316", "#0ea5e9"];

const resolvePhotoUrl = (name: string, index = 0) => {
  if (name.startsWith("http") || name.startsWith("data:") || name.startsWith("blob:")) return name;
  const color = palette[index % palette.length];
  const label = name.replace(/[-_]/g, " ");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'><rect width='400' height='300' fill='${color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='28' fill='white'>${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const normalizePhotos = (photos?: (string | PhotoAsset)[]) => {
  if (!photos || photos.length === 0) return [] as PhotoAsset[];
  return photos.map((photo, index) =>
    typeof photo === "string"
      ? { name: photo, src: resolvePhotoUrl(photo, index) }
      : { name: photo.name, src: photo.src ?? resolvePhotoUrl(photo.name, index) },
  );
};

const getFirstPhoto = (photos?: (string | PhotoAsset)[]) => {
  const normalized = normalizePhotos(photos);
  return normalized[0];
};

const defaultOpenFirings: OpenFiring[] = [
  {
    id: "1",
    kilnName: "Big Manual Kiln",
    status: "Ramp 2",
    targetCone: "6",
    targetTemp: 2232,
    startedAt: "2024-06-02T08:15:00Z",
    loadPhotos: [
      { name: "load-front.jpg", src: resolvePhotoUrl("load-front.jpg", 0) },
      { name: "load-shelf.jpg", src: resolvePhotoUrl("load-shelf.jpg", 1) },
    ],
    firstPhoto: getFirstPhoto([
      { name: "load-front.jpg", src: resolvePhotoUrl("load-front.jpg", 0) },
      { name: "load-shelf.jpg", src: resolvePhotoUrl("load-shelf.jpg", 1) },
    ]),
  },
  {
    id: "2",
    kilnName: "Test Kiln",
    status: "Candling",
    targetCone: "04",
    targetTemp: 1940,
    startedAt: "2024-06-03T06:30:00Z",
    loadPhotos: [{ name: "test-candling.jpg", src: resolvePhotoUrl("test-candling.jpg", 2) }],
    firstPhoto: getFirstPhoto([{ name: "test-candling.jpg", src: resolvePhotoUrl("test-candling.jpg", 2) }]),
  },
];

export default function KilnDashboardPage() {
  const [openFirings, setOpenFirings] = useState<OpenFiring[]>(defaultOpenFirings);
  const [firingHistory, setFiringHistory] = useState<FiringHistoryRow[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedKiln, setSelectedKiln] = useState<string>("all");
  const [selectedCone, setSelectedCone] = useState<string>("all");
  const [minReached, setMinReached] = useState<string>("");
  const [maxReached, setMaxReached] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoAsset[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [galleryTitle, setGalleryTitle] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let active = true;

    const loadSharedFirings = async () => {
      try {
        const open = await readSharedJson("kiln-open-firings", defaultOpenFirings);
        const normalizedOpen = Array.isArray(open)
          ? open.map((firing: any, index: number) => {
              const collected = collectPhotosForFiring(firing.id, firing.loadPhotos ?? []);
              return {
                ...firing,
                loadPhotos: firing.loadPhotos ?? [],
                firstPhoto: collected[0] ?? firing.firstPhoto ?? getFirstPhoto(firing.loadPhotos),
                startedAt: firing.startedAt ?? firing.startTime ?? firing.date ?? defaultOpenFirings[index]?.startedAt,
              };
            })
          : defaultOpenFirings;

        if (!active) return;
        setOpenFirings(normalizedOpen);

        if (!open || (Array.isArray(open) && open.length === 0)) {
          await persistSharedJson("kiln-open-firings", defaultOpenFirings);
        }
      } catch (error) {
        console.error("Unable to parse open firings", error);
      }

      try {
        const history = await readSharedJson("kiln-firing-history", [] as FiringHistoryRow[]);
        const normalizedHistory = Array.isArray(history)
          ? history.map((firing: any) => {
              const collected = collectPhotosForFiring(firing.id, firing.loadPhotos ?? []);
              return {
                ...firing,
                loadPhotos: firing.loadPhotos ?? [],
                firstPhoto: collected[0] ?? firing.firstPhoto ?? getFirstPhoto(firing.loadPhotos),
              };
            })
          : [];

        if (!active) return;
        setFiringHistory(normalizedHistory);
      } catch (error) {
        console.error("Unable to parse firing history", error);
        if (active) setFiringHistory([]);
      }
    };

    void loadSharedFirings();

    return () => {
      active = false;
    };
  }, []);

  const collectPhotosForFiring = (firingId: string, loadPhotos?: (string | PhotoAsset)[]) => {
    const unique = new Map<string, PhotoAsset>();

    const addPhotos = (list?: (string | PhotoAsset)[]) => {
      normalizePhotos(list).forEach((photo) => {
        const key = `${photo.name}-${photo.src}`;
        if (!unique.has(key)) {
          unique.set(key, photo);
        }
      });
    };

    addPhotos(loadPhotos);

    if (typeof window !== "undefined") {
      ["kiln-open-firing-details", "kiln-firing-history-details"].forEach((key) => {
        const raw = window.localStorage.getItem(key);
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          const detail = parsed?.[firingId];
          if (detail?.loadPhotos) {
            addPhotos(detail.loadPhotos);
          }
        } catch (error) {
          console.error(`Unable to parse ${key} for photos`, error);
        }
      });

      const eventsRaw = window.localStorage.getItem(`firing-${firingId}-events`);
      if (eventsRaw) {
        try {
          const events = JSON.parse(eventsRaw);
          events.forEach((event: any) => addPhotos(event.photos));
        } catch (error) {
          console.error("Unable to parse stored firing events for photos", error);
        }
      }
    }

    return Array.from(unique.values());
  };

  const openGalleryForFiring = (firingId: string, loadPhotos: (string | PhotoAsset)[] | undefined, title: string) => {
    const photos = collectPhotosForFiring(firingId, loadPhotos);
    if (photos.length === 0) return;
    setGalleryPhotos(photos);
    setActivePhotoIndex(0);
    setGalleryTitle(title);
  };

  const closeGallery = () => {
    setActivePhotoIndex(null);
    setGalleryPhotos([]);
    setGalleryTitle("");
  };

  const showNextPhoto = () => {
    if (activePhotoIndex === null || galleryPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null ? prev : (prev + 1) % galleryPhotos.length));
  };

  const showPreviousPhoto = () => {
    if (activePhotoIndex === null || galleryPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev === null ? prev : (prev - 1 + galleryPhotos.length) % galleryPhotos.length));
  };

  const kilnOptions = useMemo(() => {
    const kilnNames = firingHistory.map((firing) => firing.kiln);
    return Array.from(new Set(kilnNames));
  }, [firingHistory]);

  const coneOptions = useMemo(() => {
    const cones = firingHistory.map((firing) => firing.targetCone);
    return Array.from(new Set(cones));
  }, [firingHistory]);

  const filteredHistory = useMemo(() => {
    return firingHistory.filter((firing) => {
      if (selectedKiln !== "all" && firing.kiln !== selectedKiln) return false;
      if (selectedCone !== "all" && firing.targetCone !== selectedCone) return false;

      const firingDate = new Date(firing.date);
      if (startDate && firingDate < new Date(startDate)) return false;
      if (endDate && firingDate > new Date(endDate)) return false;

      if (minReached) {
        const min = Number(minReached);
        if (Number.isFinite(min)) {
          if (!firing.tempReached || firing.tempReached < min) return false;
        }
      }

      if (maxReached) {
        const max = Number(maxReached);
        if (Number.isFinite(max)) {
          if (!firing.tempReached || firing.tempReached > max) return false;
        }
      }

      return true;
    });
  }, [endDate, firingHistory, maxReached, minReached, selectedCone, selectedKiln, startDate]);

  const clearFilters = () => {
    setSelectedKiln("all");
    setSelectedCone("all");
    setMinReached("");
    setMaxReached("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 pb-12">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
              Kiln Tracker
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Firing dashboard</h1>
                <p className="mt-1 text-base text-gray-700">
                  Jump into open firings or review your firing history.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-purple-800 ring-1 ring-purple-200 transition hover:bg-purple-50"
              >
                ← Back to home
              </Link>
            </div>
          </div>
          <Link
            href="/firings/new"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
          >
            Start new firing
          </Link>
        </header>

        <section className="grid gap-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Open firings</h2>
              <p className="text-sm text-gray-600">Quick links to active logs.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {openFirings.map((firing) => (
              <Link
                key={firing.id}
                href={`/firings/${firing.id}`}
                className="group flex items-center justify-between rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  {firing.firstPhoto ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openGalleryForFiring(firing.id, firing.loadPhotos, firing.kilnName);
                      }}
                      className="group/btn relative overflow-hidden rounded-xl ring-1 ring-purple-200"
                    >
                      <img
                        src={firing.firstPhoto.src}
                        alt={`${firing.kilnName} first photo`}
                        className="h-20 w-24 object-cover"
                      />
                      <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Photos</span>
                    </button>
                  ) : (
                    <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-purple-50 text-xs font-semibold text-purple-700 ring-1 ring-dashed ring-purple-200">
                      No photo
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-purple-700">{firing.kilnName}</p>
                    <h3 className="text-lg font-bold text-gray-900">Cone {firing.targetCone}</h3>
                    <p className="text-sm text-gray-700">
                      Target {firing.targetTemp ? `${firing.targetTemp}°F` : "—"}
                    </p>
                    <p className="text-xs text-gray-500">Started {formatDateTime(firing.startedAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800 ring-2 ring-purple-200">
                    {firing.status}
                  </div>
                  {firing.firstPhoto && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        openGalleryForFiring(firing.id, firing.loadPhotos, firing.kilnName);
                      }}
                      className="text-xs font-semibold text-purple-700 underline-offset-4 hover:underline"
                    >
                      View photos
                    </button>
                  )}
                </div>
              </Link>
            ))}
            {openFirings.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-purple-50/60 p-6 text-center text-sm text-gray-600">
                No open firings right now. Start one to begin logging.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Firing history</h2>
              <p className="text-sm text-gray-600">Click into any firing to review logs, photos, and pieces.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
              >
                <span aria-hidden>⏷</span>
                Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>
          {isFilterOpen && (
            <div className="grid gap-4 rounded-2xl border border-purple-100 bg-white/80 p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-1 text-sm font-medium text-gray-800">
                Kiln
                <select
                  id="kiln-filter"
                  value={selectedKiln}
                  onChange={(event) => setSelectedKiln(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="all">All kilns</option>
                  {kilnOptions.map((kiln) => (
                    <option key={kiln} value={kiln}>
                      {kiln}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium text-gray-800">
                Target cone
                <select
                  value={selectedCone}
                  onChange={(event) => setSelectedCone(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="all">All cones</option>
                  {coneOptions.map((cone) => (
                    <option key={cone} value={cone}>
                      Cone {cone}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-2 rounded-xl bg-purple-50/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Date range</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Start
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    End
                    <input
                      type="date"
                      value={endDate}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                </div>
              </div>
              <div className="space-y-2 rounded-xl bg-purple-50/60 p-3 md:col-span-2 lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Temp reached (°F)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Min
                    <input
                      type="number"
                      inputMode="numeric"
                      value={minReached}
                      onChange={(event) => setMinReached(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                  <label className="space-y-1 text-sm font-medium text-gray-800">
                    Max
                    <input
                      type="number"
                      inputMode="numeric"
                      value={maxReached}
                      onChange={(event) => setMaxReached(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-hidden rounded-3xl bg-white/90 shadow-lg ring-1 ring-purple-100">
            <table className="min-w-full divide-y divide-purple-100">
              <thead className="bg-purple-50/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Kiln
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Photos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Target Cone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Target Temp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-purple-800">
                    Temp Reached
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/70">
                {filteredHistory.map((firing) => (
                  <tr key={firing.id} className="hover:bg-purple-50/60">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatDate(firing.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{firing.kiln}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {firing.firstPhoto ? (
                        <button
                          type="button"
                          onClick={() => openGalleryForFiring(firing.id, firing.loadPhotos, firing.kiln)}
                          className="group relative overflow-hidden rounded-lg ring-1 ring-purple-200"
                        >
                          <img
                            src={firing.firstPhoto.src}
                            alt={`${firing.kiln} firing photo`}
                            className="h-16 w-20 object-cover"
                          />
                          <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">View</span>
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-gray-500">No photo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">Cone {firing.targetCone}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {firing.targetTemp ? `${firing.targetTemp}°F` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {firing.tempReached ? `${firing.tempReached}°F` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/firings/${firing.id}`}
                        className="text-sm font-semibold text-purple-700 underline-offset-4 hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-600">
                      No firing history yet. Close a firing to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {activePhotoIndex !== null && galleryPhotos[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white/95 p-4 shadow-2xl ring-1 ring-purple-200">
            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                onClick={showPreviousPhoto}
                className="rounded-full bg-purple-100 p-2 text-purple-800 shadow hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={galleryPhotos.length <= 1}
              >
                ←
              </button>
              <button
                type="button"
                onClick={showNextPhoto}
                className="rounded-full bg-purple-100 p-2 text-purple-800 shadow hover:bg-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={galleryPhotos.length <= 1}
              >
                →
              </button>
              <button
                type="button"
                onClick={closeGallery}
                className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800 shadow hover:bg-gray-300"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-purple-800">{galleryTitle}</p>
              <img
                src={galleryPhotos[activePhotoIndex].src}
                alt={galleryPhotos[activePhotoIndex].name}
                className="max-h-[70vh] w-full rounded-2xl object-contain"
              />
              <p className="text-sm font-semibold text-gray-800">{galleryPhotos[activePhotoIndex].name}</p>
              {galleryPhotos.length > 1 && (
                <p className="text-xs text-gray-600">Photo {activePhotoIndex + 1} of {galleryPhotos.length}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
