"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type Tab = {
  id: string;
  label: string;
  summary: string;
  content: ReactNode;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

type KilnType = "manual" | "digital";
type ManualControl = "switches" | "dial";

type StudioColor = {
  id: number;
  name: string;
  brand: string;
  retired: boolean;
};

type Kiln = {
  id: number;
  nickname: string;
  type: KilnType;
  manualControl?: ManualControl;
  switches?: number;
};

const initialUsers: User[] = [
  {
    id: 1,
    firstName: "Jamie",
    lastName: "Rivera",
    username: "jrivera",
    password: "wheelThrow123",
  },
  {
    id: 2,
    firstName: "Taylor",
    lastName: "Shaw",
    username: "tshaw",
    password: "glazeGuard!",
  },
  {
    id: 3,
    firstName: "Morgan",
    lastName: "Lee",
    username: "mlee",
    password: "kilnSafe2024",
  },
];

const coneChart = [
  { cone: "10", temperatureF: 2381 },
  { cone: "9", temperatureF: 2336 },
  { cone: "8", temperatureF: 2305 },
  { cone: "7", temperatureF: 2264 },
  { cone: "6", temperatureF: 2232 },
  { cone: "5", temperatureF: 2194 },
  { cone: "4", temperatureF: 2157 },
  { cone: "3", temperatureF: 2134 },
  { cone: "2", temperatureF: 2124 },
  { cone: "1", temperatureF: 2118 },
  { cone: "01", temperatureF: 2084 },
  { cone: "02", temperatureF: 2068 },
  { cone: "03", temperatureF: 2052 },
  { cone: "04", temperatureF: 2030 },
  { cone: "05", temperatureF: 2014 },
  { cone: "06", temperatureF: 1940 },
  { cone: "07", temperatureF: 1888 },
  { cone: "08", temperatureF: 1830 },
  { cone: "09", temperatureF: 1789 },
  { cone: "010", temperatureF: 1753 },
  { cone: "011", temperatureF: 1693 },
  { cone: "012", temperatureF: 1673 },
  { cone: "013", temperatureF: 1641 },
  { cone: "014", temperatureF: 1623 },
  { cone: "015", temperatureF: 1607 },
  { cone: "016", temperatureF: 1566 },
  { cone: "017", temperatureF: 1540 },
  { cone: "018", temperatureF: 1450 },
  { cone: "019", temperatureF: 1377 },
  { cone: "020", temperatureF: 1323 },
  { cone: "021", temperatureF: 1261 },
  { cone: "022", temperatureF: 1180 },
];

const initialKilns: Kiln[] = [
  {
    id: 1,
    nickname: "Studio Workhorse",
    type: "digital",
  },
  {
    id: 2,
    nickname: "Manual Test Kiln",
    type: "manual",
    manualControl: "switches",
    switches: 3,
  },
  {
    id: 3,
    nickname: "Glaze Trials",
    type: "manual",
    manualControl: "dial",
  },
];

const initialColors: StudioColor[] = [
  { id: 1, name: "Celadon", brand: "Amaco", retired: false },
  { id: 2, name: "Shino", brand: "Coyote", retired: false },
  { id: 3, name: "Tenmoku", brand: "Laguna", retired: true },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<string>("users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [form, setForm] = useState<Omit<User, "id">>({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [kilns, setKilns] = useState<Kiln[]>(initialKilns);
  const [kilnForm, setKilnForm] = useState<Omit<Kiln, "id">>({
    nickname: "",
    type: "digital",
    manualControl: "switches",
    switches: 3,
  });
  const [editingKilnId, setEditingKilnId] = useState<number | null>(null);
  const [colors, setColors] = useState<StudioColor[]>(initialColors);
  const [colorForm, setColorForm] = useState<Omit<StudioColor, "id" | "retired">>({
    name: "",
    brand: "",
  });

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", username: "", password: "" });
    setEditingId(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.firstName || !form.lastName || !form.username || !form.password) {
      return;
    }

    if (editingId) {
      setUsers((prev) =>
        prev.map((user) => (user.id === editingId ? { ...user, ...form } : user))
      );
    } else {
      const nextId = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;
      setUsers((prev) => [...prev, { id: nextId, ...form }]);
    }

    resetForm();
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: user.password,
    });
  };

  const resetKilnForm = () => {
    setKilnForm({
      nickname: "",
      type: "digital",
      manualControl: "switches",
      switches: 3,
    });
    setEditingKilnId(null);
  };

  const handleKilnSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!kilnForm.nickname || !kilnForm.type) {
      return;
    }

    const payload: Omit<Kiln, "id"> = {
      ...kilnForm,
      manualControl: kilnForm.type === "manual" ? kilnForm.manualControl : undefined,
      switches:
        kilnForm.type === "manual" && kilnForm.manualControl === "switches"
          ? kilnForm.switches
          : undefined,
    };

    if (editingKilnId) {
      setKilns((prev) =>
        prev.map((kiln) => (kiln.id === editingKilnId ? { ...kiln, ...payload } : kiln))
      );
    } else {
      const nextId = kilns.length ? Math.max(...kilns.map((kiln) => kiln.id)) + 1 : 1;
      setKilns((prev) => [...prev, { id: nextId, ...payload }]);
    }

    resetKilnForm();
  };

  const startKilnEdit = (kiln: Kiln) => {
    setEditingKilnId(kiln.id);
    setKilnForm({
      nickname: kiln.nickname,
      type: kiln.type,
      manualControl: kiln.manualControl ?? "switches",
      switches: kiln.switches ?? 3,
    });
  };

  const usersContent = useMemo(
    () => (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                Users
              </p>
              <h2 className="text-2xl font-bold text-gray-900">Manage site accounts</h2>
              <p className="text-sm text-gray-600">
                Add new team members or reset passwords when someone forgets.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
            <div className="grid grid-cols-5 bg-purple-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-purple-800">
              <span>First Name</span>
              <span>Last Name</span>
              <span>Username</span>
              <span>Password</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-purple-100">
              {users.map((user) => (
                <li key={user.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800">
                  <span className="font-semibold">{user.firstName}</span>
                  <span>{user.lastName}</span>
                  <span className="font-mono text-xs text-gray-600">{user.username}</span>
                  <span className="font-mono text-xs text-gray-600">•••••••</span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(user)}
                      className="rounded-full border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? "Edit user" : "Add a new user"}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {editingId
              ? "Update the user's password or details and save the changes."
              : "Create a new account with manual entry for all fields."}
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                placeholder="Jordan"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                placeholder="Patel"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                placeholder="jpatel"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="text"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                placeholder="Set a secure password"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
              >
                {editingId ? "Save changes" : "Add user"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    ),
    [users, form, editingId]
  );

  const kilnContent = useMemo(
    () => (
      <div className="grid gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Kilns</p>
              <h2 className="text-2xl font-bold text-gray-900">Add and manage kilns</h2>
              <p className="text-sm text-gray-600">
                Capture kiln type and controls, and reference the firing cone chart for temperatures.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
            <div className="grid grid-cols-5 bg-purple-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-purple-800">
              <span>Nickname</span>
              <span>Type</span>
              <span>Controls</span>
              <span>Switches</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-purple-100">
              {kilns.map((kiln) => (
                <li
                  key={kiln.id}
                  className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800"
                >
                  <span className="font-semibold">{kiln.nickname}</span>
                  <span className="capitalize">{kiln.type}</span>
                  <span className="text-sm text-gray-600">
                    {kiln.type === "manual"
                      ? kiln.manualControl === "switches"
                        ? "Switches"
                        : "Dial"
                      : "Digital Panel"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {kiln.type === "manual" && kiln.manualControl === "switches"
                      ? `${kiln.switches ?? 0} switches`
                      : "—"}
                  </span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startKilnEdit(kiln)}
                      className="rounded-full border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                  Firing temperatures
                </p>
                <h3 className="text-lg font-bold text-gray-900">Cone reference chart</h3>
                <p className="text-sm text-gray-600">
                  Use this chart to look up cone numbers and their corresponding °F targets.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-purple-100 bg-purple-100 text-sm font-semibold uppercase tracking-wide text-purple-800">
              <div className="bg-purple-50/60 px-4 py-3">Cone</div>
              <div className="bg-purple-50/60 px-4 py-3 text-right">Temperature (°F)</div>
            </div>
            <ul className="divide-y divide-purple-100">
              {coneChart.map((entry) => (
                <li key={entry.cone} className="grid grid-cols-2 items-center px-4 py-2 text-sm text-gray-800">
                  <span className="font-semibold">Cone {entry.cone}</span>
                  <span className="text-right font-mono text-xs text-gray-600">{entry.temperatureF}°F</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingKilnId ? "Edit kiln" : "Add a new kiln"}
          </h3>
            <p className="mt-1 text-sm text-gray-600">
              {editingKilnId
                ? "Update kiln controls or nickname."
                : "Enter kiln details, including control style."}
            </p>

          <form className="mt-4 space-y-4" onSubmit={handleKilnSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800" htmlFor="nickname">
                Nickname
              </label>
              <input
                id="nickname"
                name="nickname"
                value={kilnForm.nickname}
                onChange={(event) => setKilnForm((prev) => ({ ...prev, nickname: event.target.value }))}
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                placeholder="Front Room Kiln"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-sm font-semibold text-gray-800">Type</span>
              <div className="grid grid-cols-2 gap-2">
                {["digital", "manual"].map((type) => {
                  const label = type === "digital" ? "Digital" : "Manual";
                  const isActive = kilnForm.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setKilnForm((prev) => ({
                          ...prev,
                          type: type as KilnType,
                          manualControl: type === "manual" ? prev.manualControl ?? "switches" : undefined,
                          switches:
                            type === "manual" && prev.manualControl === "switches"
                              ? prev.switches ?? 3
                              : undefined,
                        }))
                      }
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "border-purple-200 bg-purple-600 text-white shadow-lg"
                          : "border-purple-100 bg-white text-gray-800 hover:border-purple-200 hover:bg-purple-50"
                      }`}
                    >
                      {label}
                      <span
                        className={`mt-1 block text-xs ${
                          isActive ? "text-purple-50/90" : "text-gray-500"
                        }`}
                      >
                        {type === "digital"
                          ? "Programmable controller"
                          : "Switches or dial control"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {kilnForm.type === "manual" && (
              <div className="space-y-2 rounded-2xl bg-white/70 p-4 ring-1 ring-purple-100">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-800" htmlFor="control-style">
                    Manual control style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["switches", "dial"].map((control) => {
                      const isActive = kilnForm.manualControl === control;
                      const label = control === "switches" ? "Switches" : "Dial";
                      return (
                        <button
                          key={control}
                          type="button"
                          onClick={() =>
                            setKilnForm((prev) => ({
                              ...prev,
                              manualControl: control as ManualControl,
                              switches: control === "switches" ? prev.switches ?? 3 : undefined,
                            }))
                          }
                          className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                            isActive
                              ? "border-purple-200 bg-purple-100 text-purple-900"
                              : "border-purple-100 bg-white text-gray-800 hover:border-purple-200"
                          }`}
                        >
                          {label}
                          <span className="mt-0.5 block text-xs text-gray-600">
                            {control === "switches" ? "Toggle banks" : "Single kiln sitter dial"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {kilnForm.manualControl === "switches" && (
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="switches">
                      Number of switches
                    </label>
                    <input
                      id="switches"
                      name="switches"
                      type="number"
                      min={1}
                      max={6}
                      value={kilnForm.switches ?? 3}
                      onChange={(event) =>
                        setKilnForm((prev) => ({
                          ...prev,
                          switches: Number(event.target.value) || 1,
                        }))
                      }
                      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
              >
                {editingKilnId ? "Save kiln" : "Add kiln"}
              </button>
              {editingKilnId && (
                <button
                  type="button"
                  onClick={resetKilnForm}
                  className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    ),
    [kilns, kilnForm, editingKilnId]
  );

  const potteryContent = (
    <div className="grid gap-8 xl:grid-cols-3">
      <div className="xl:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Colors</p>
            <h2 className="text-2xl font-bold text-gray-900">Studio glaze colors</h2>
            <p className="text-sm text-gray-600">
              Track which colors are active in the studio, add new glazes, or retire them to the archive.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Active colours</p>
              <h3 className="text-lg font-bold text-gray-900">Current studio palette</h3>
              <p className="text-sm text-gray-600">Retire colours to move them into the archive.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 bg-purple-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-purple-800">
            <span>Colour Name</span>
            <span>Brand</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-purple-100">
            {colors.filter((color) => !color.retired).map((color) => (
              <li key={color.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-800">
                <span className="font-semibold">{color.name}</span>
                <span className="text-gray-700">{color.brand}</span>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setColors((prev) =>
                        prev.map((entry) => (entry.id === color.id ? { ...entry, retired: true } : entry))
                      )
                    }
                    className="rounded-full border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                  >
                    Retire
                  </button>
                </div>
              </li>
            ))}
            {colors.filter((color) => !color.retired).length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-600">No active colours yet. Add one using the form.</li>
            )}
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Archived colours</p>
              <h3 className="text-lg font-bold text-gray-900">Retired glaze library</h3>
              <p className="text-sm text-gray-600">Restore colours to make them active again.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 bg-purple-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-purple-800">
            <span>Colour Name</span>
            <span>Brand</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-purple-100">
            {colors.filter((color) => color.retired).map((color) => (
              <li key={color.id} className="grid grid-cols-3 items-center px-4 py-3 text-sm text-gray-800">
                <span className="font-semibold">{color.name}</span>
                <span className="text-gray-700">{color.brand}</span>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setColors((prev) =>
                        prev.map((entry) => (entry.id === color.id ? { ...entry, retired: false } : entry))
                      )
                    }
                    className="rounded-full border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                  >
                    Restore
                  </button>
                </div>
              </li>
            ))}
            {colors.filter((color) => color.retired).length === 0 && (
              <li className="px-4 py-6 text-sm text-gray-600">No archived colours yet.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-inner">
        <h3 className="text-lg font-semibold text-gray-900">Add a new colour</h3>
        <p className="mt-1 text-sm text-gray-600">
          Capture the glaze name and brand, then add it to the active studio list.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!colorForm.name || !colorForm.brand) return;
            const nextId = colors.length ? Math.max(...colors.map((color) => color.id)) + 1 : 1;
            setColors((prev) => [...prev, { id: nextId, ...colorForm, retired: false }]);
            setColorForm({ name: "", brand: "" });
          }}
        >
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-800" htmlFor="color-name">
              Colour Name
            </label>
            <input
              id="color-name"
              name="color-name"
              value={colorForm.name}
              onChange={(event) => setColorForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="Frost Blue"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-800" htmlFor="color-brand">
              Brand
            </label>
            <input
              id="color-brand"
              name="color-brand"
              value={colorForm.brand}
              onChange={(event) => setColorForm((prev) => ({ ...prev, brand: event.target.value }))}
              className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-purple-400 focus:outline-none"
              placeholder="Amaco"
              required
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-purple-700"
            >
              Add colour
            </button>
            <button
              type="button"
              onClick={() => setColorForm({ name: "", brand: "" })}
              className="rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const tabs: Tab[] = [
    {
      id: "users",
      label: "Users",
      summary: "Manage site users and credentials for the studio.",
      content: usersContent,
    },
    {
      id: "kiln",
      label: "Kiln",
      summary: "Add and manage kilns, controls, and reference firing cones.",
      content: kilnContent,
    },
    {
      id: "pottery",
      label: "Pottery",
      summary: "Add and archive studio glaze colors.",
      content: potteryContent,
    },
  ];

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
  const activeSummary = tabs.find((tab) => tab.id === activeTab)?.summary;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
              Admin Panel
            </p>
            <h1 className="text-4xl font-bold text-gray-900">Manage your studio</h1>
            <p className="mt-2 text-base text-gray-600">{activeSummary}</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-purple-200 hover:text-purple-800"
          >
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64">
            <div className="sticky top-8 space-y-2">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-purple-200 bg-purple-600 text-white shadow-lg"
                        : "border-purple-100 bg-white text-gray-800 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`mt-1 block text-xs ${
                        isActive ? "text-purple-50/90" : "text-gray-500"
                      }`}
                    >
                      {tab.summary}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 rounded-3xl border border-purple-100 bg-white p-6 shadow-lg">
            {activeContent}
          </section>
        </div>
      </div>
    </main>
  );
}
