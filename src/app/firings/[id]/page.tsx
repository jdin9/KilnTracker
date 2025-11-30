'use client';

import React, { useMemo, useState } from "react";
import { notFound } from "next/navigation";

// TODO: replace with trpc.firing.detail.useQuery and mutations
const mockFiring = {
  id: "1",
  kilnName: "Big Manual Kiln",
  firingType: "glaze",
  status: "ongoing" as const,
  targetCone: "6",
  startTime: new Date().toISOString(),
  maxTemp: null as number | null,
  events: [
    { id: "e1", timestamp: new Date().toISOString(), type: "temp_reading", pyrometerTemp: 1200 },
  ],
};

type NewEvent = {
  eventType: string;
  noteText?: string;
  pyrometerTemp?: string;
  switchIndex?: string;
  newSwitchPosition?: string;
};

export default function FiringDetailPage({ params }: { params: { id: string } }) {
  // const { data, isLoading } = trpc.firing.detail.useQuery({ id: params.id });
  const data = mockFiring; // placeholder

  if (!data) return notFound();

  const [newEvent, setNewEvent] = useState<NewEvent>({ eventType: "note" });

  // TODO: use mutation
  const addEvent = async () => {
    console.log("Add event", newEvent);
  };

  const completeFiring = async () => {
    console.log("Complete firing");
  };

  const sortedEvents = useMemo(() => data.events, [data.events]);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firing Detail</h1>
          <p className="text-sm text-gray-600">
            {data.kilnName} • {data.firingType} • {data.status}
          </p>
          <p className="text-sm text-gray-600">
            Started {new Date(data.startTime).toLocaleString()} | Target cone {data.targetCone}
          </p>
        </div>
        {data.status === "ongoing" && (
          <button
            className="px-3 py-2 bg-green-600 text-white rounded"
            onClick={completeFiring}
          >
            Mark as Completed
          </button>
        )}
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Firing Log</h2>
        <div className="border rounded divide-y">
          {sortedEvents.map((event) => (
            <div key={event.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {event.type}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
              {event.pyrometerTemp && (
                <div className="text-sm text-gray-700">Temp: {event.pyrometerTemp}°</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {data.status === "ongoing" && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Add Event</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium">Event Type</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={newEvent.eventType}
                onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
              >
                <option value="note">Note</option>
                <option value="temp_reading">Temp Reading</option>
                <option value="switch_on">Switch On</option>
                <option value="switch_off">Switch Off</option>
                <option value="lid_open">Lid Open</option>
                <option value="lid_closed">Lid Closed</option>
              </select>
            </div>
            {newEvent.eventType === "temp_reading" && (
              <div className="space-y-1">
                <label className="block text-sm font-medium">Pyrometer Temp</label>
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  value={newEvent.pyrometerTemp || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, pyrometerTemp: e.target.value })}
                />
              </div>
            )}
            {(newEvent.eventType === "switch_on" || newEvent.eventType === "switch_off") && (
              <>
                <div className="space-y-1">
                  <label className="block text-sm font-medium">Switch Index</label>
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-full"
                    value={newEvent.switchIndex || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, switchIndex: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium">New Switch Position</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    placeholder="off/low/med/high"
                    value={newEvent.newSwitchPosition || ""}
                    onChange={(e) => setNewEvent({ ...newEvent, newSwitchPosition: e.target.value })}
                  />
                </div>
              </>
            )}
            {newEvent.eventType === "note" && (
              <div className="col-span-2 space-y-1">
                <label className="block text-sm font-medium">Note</label>
                <textarea
                  className="border rounded px-2 py-1 w-full"
                  rows={3}
                  value={newEvent.noteText || ""}
                  onChange={(e) => setNewEvent({ ...newEvent, noteText: e.target.value })}
                />
              </div>
            )}
          </div>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={addEvent}
          >
            Append Event
          </button>
        </section>
      )}
    </main>
  );
}
