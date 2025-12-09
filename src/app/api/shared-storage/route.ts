import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const STORAGE_PATH = path.join(process.cwd(), "data", "shared-storage.json");

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKv = Boolean(kvUrl && kvToken);

const kvHeaders = kvToken
  ? {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    }
  : undefined;

async function readAllFromKv(): Promise<Record<string, string> | null> {
  if (!hasKv || !kvHeaders || !kvUrl) return null;

  try {
    const response = await fetch(`${kvUrl}/hgetall/kilntracker:shared`, {
      headers: kvHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`KV hgetall failed with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, string> | null;
    return data ?? {};
  } catch (error) {
    console.error("Failed to read shared storage from KV", error);
    return null;
  }
}

async function writeAllToKv(payload: Record<string, string>) {
  if (!hasKv || !kvHeaders || !kvUrl) return false;

  try {
    const response = await fetch(`${kvUrl}/hset/kilntracker:shared`, {
      method: "POST",
      headers: kvHeaders,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`KV hset failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to write shared storage to KV", error);
    return false;
  }
}

async function ensureStorageFile() {
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });

  try {
    await fs.access(STORAGE_PATH);
  } catch (error) {
    await fs.writeFile(STORAGE_PATH, "{}", "utf-8");
  }
}

async function readStorage(): Promise<Record<string, string>> {
  if (hasKv) {
    const fromKv = await readAllFromKv();
    if (fromKv) return fromKv;
  }

  await ensureStorageFile();

  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (error) {
    console.error("Failed to read shared storage", error);
    return {};
  }
}

async function writeStorage(payload: Record<string, string>) {
  if (hasKv && (await writeAllToKv(payload))) return;

  await ensureStorageFile();

  try {
    await fs.writeFile(STORAGE_PATH, JSON.stringify(payload, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write shared storage", error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const data = await readStorage();
  return NextResponse.json({ value: data[key] ?? null });
}

export async function POST(request: Request) {
  const body = await request.json();
  const key = typeof body.key === "string" ? body.key : undefined;
  const value = typeof body.value === "string" ? body.value : undefined;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  if (value === undefined) {
    return NextResponse.json({ error: "Missing value" }, { status: 400 });
  }

  const current = await readStorage();
  const updated = { ...current, [key]: value };
  await writeStorage(updated);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const key = typeof body.key === "string" ? body.key : undefined;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const current = await readStorage();
  if (!(key in current)) {
    return NextResponse.json({ ok: true });
  }

  const { [key]: _, ...rest } = current;
  await writeStorage(rest);

  return NextResponse.json({ ok: true });
}
