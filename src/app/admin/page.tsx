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

  const usersContent = useMemo(
    () => (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                Users
              </p>
              <h2 className="text-2xl font-bold text-gray-900">Manage site accounts</h2>
              <p className="text-sm text-gray-600">
                Add new team members or reset passwords when someone forgets.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
            <div className="grid grid-cols-5 bg-amber-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-amber-800">
              <span>First Name</span>
              <span>Last Name</span>
              <span>Username</span>
              <span>Password</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-amber-100">
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
                      className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 shadow-inner">
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
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-amber-400 focus:outline-none"
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
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-amber-400 focus:outline-none"
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
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-amber-400 focus:outline-none"
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
                className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-amber-400 focus:outline-none"
                placeholder="Set a secure password"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700"
              >
                {editingId ? "Save changes" : "Add user"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
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

  const kilnContent = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Kiln oversight</h2>
      <p className="text-gray-700">
        Monitor kiln status, schedules, and maintenance plans to keep firings on track.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {["Upcoming firings", "Service calendar"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-amber-700">{item}</p>
            <p className="mt-1 text-sm text-gray-600">
              Assign kiln slots, confirm readiness, and ensure safety checks are complete.
            </p>
            <button className="mt-3 rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50">
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const potteryContent = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Pottery workflows</h2>
      <p className="text-gray-700">
        Keep clay bodies, glazes, and project timelines organized for the studio team.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {["Project tracker", "Glaze library"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-amber-700">{item}</p>
            <p className="mt-1 text-sm text-gray-600">
              Manage batches, notes, and firing outcomes to keep pottery moving smoothly.
            </p>
            <button className="mt-3 rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50">
              Open
            </button>
          </div>
        ))}
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
      summary: "Oversee kiln schedules and maintenance tasks.",
      content: kilnContent,
    },
    {
      id: "pottery",
      label: "Pottery",
      summary: "Track pottery projects and glaze resources.",
      content: potteryContent,
    },
  ];

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;
  const activeSummary = tabs.find((tab) => tab.id === activeTab)?.summary;

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
              Admin Panel
            </p>
            <h1 className="text-4xl font-bold text-gray-900">Manage your studio</h1>
            <p className="mt-2 text-base text-gray-600">{activeSummary}</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-amber-200 hover:text-amber-800"
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
                        ? "border-amber-200 bg-amber-600 text-white shadow-lg"
                        : "border-amber-100 bg-white text-gray-800 hover:border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`mt-1 block text-xs ${
                        isActive ? "text-amber-50/90" : "text-gray-500"
                      }`}
                    >
                      {tab.summary}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex-1 rounded-3xl border border-amber-100 bg-white p-6 shadow-lg">
            {activeContent}
          </section>
        </div>
      </div>
    </main>
  );
}
