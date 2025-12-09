import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const STORAGE_PATH = path.join(process.cwd(), "data", "shared-storage.json");

type NeonConfig = {
  endpoint: string;
  authHeader: string;
  database?: string;
};

function parseNeonConfig(): NeonConfig | null {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  try {
    const url = new URL(databaseUrl);
    if (!url.hostname.includes(".neon.tech")) return null;

    const auth = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
    const authHeader = `Basic ${Buffer.from(auth).toString("base64")}`;
    const database = url.pathname.replace(/^\//, "") || undefined;

    return {
      endpoint: `https://${url.hostname}/sql`,
      authHeader,
      database,
    };
  } catch (error) {
    console.error("Unable to parse DATABASE_URL for Neon", error);
    return null;
  }
}

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKv = Boolean(kvUrl && kvToken);

const neonConfig = parseNeonConfig();
const hasNeon = Boolean(neonConfig);

const kvHeaders = kvToken
  ? {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    }
  : undefined;

async function ensureTable() {
  if (!hasNeon || !neonConfig) return false;

  try {
    await executeNeonQuery(
      "CREATE TABLE IF NOT EXISTS shared_storage (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())"
    );
    return true;
  } catch (error) {
    console.error("Failed to ensure shared_storage table", error);
    return false;
  }
}

async function executeNeonQuery(query: string) {
  if (!hasNeon || !neonConfig) return null;

  try {
    const response = await fetch(neonConfig.endpoint, {
      method: "POST",
      headers: {
        Authorization: neonConfig.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, database: neonConfig.database }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Neon SQL responded with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, any>;
    if (data.error) {
      throw new Error(String(data.error));
    }

    return data;
  } catch (error) {
    console.error("Failed to execute Neon SQL query", error);
    return null;
  }
}

const escapeLiteral = (input: string) => input.replace(/\\/g, "\\\\").replace(/'/g, "''");

async function readFromNeon(key: string): Promise<string | null> {
  if (!hasNeon || !(await ensureTable())) return null;

  const safeKey = escapeLiteral(key);
  const result = await executeNeonQuery(`SELECT value FROM shared_storage WHERE key = '${safeKey}' LIMIT 1;`);
  const rows = (result?.results?.[0]?.rows ?? result?.rows) as Array<{ value?: string }> | undefined;
  const value = rows?.[0]?.value;
  return typeof value === "string" ? value : null;
}

async function writeToNeon(key: string, value: string) {
  if (!hasNeon || !(await ensureTable())) return false;

  const safeKey = escapeLiteral(key);
  const safeValue = escapeLiteral(value);
  const result = await executeNeonQuery(
    `INSERT INTO shared_storage(key, value) VALUES ('${safeKey}', '${safeValue}') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();`
  );
  return Boolean(result);
}

async function deleteFromNeon(key: string) {
  if (!hasNeon || !(await ensureTable())) return false;

  const safeKey = escapeLiteral(key);
  const result = await executeNeonQuery(`DELETE FROM shared_storage WHERE key = '${safeKey}';`);
  return Boolean(result);
}

async function readFromKv(key: string): Promise<string | null> {
  if (!hasKv || !kvHeaders || !kvUrl) return null;

  try {
    const response = await fetch(`${kvUrl}/hget/kilntracker:shared/${encodeURIComponent(key)}`, {
      headers: kvHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`KV hget failed with status ${response.status}`);
    }

    const data = (await response.json()) as { result?: string | null };
    return typeof data.result === "string" ? data.result : null;
  } catch (error) {
    console.error("Failed to read shared storage from KV", error);
    return null;
  }
}

async function writeToKv(key: string, value: string) {
  if (!hasKv || !kvHeaders || !kvUrl) return false;

  try {
    const response = await fetch(`${kvUrl}/hset/kilntracker:shared`, {
      method: "POST",
      headers: kvHeaders,
      body: JSON.stringify({ [key]: value }),
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

async function deleteFromKv(key: string) {
  if (!hasKv || !kvHeaders || !kvUrl) return false;

  try {
    const response = await fetch(`${kvUrl}/hdel/kilntracker:shared/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: kvHeaders,
    });

    if (!response.ok) {
      throw new Error(`KV hdel failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete shared storage from KV", error);
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

async function readStorageValue(key: string): Promise<string | null> {
  const neonValue = await readFromNeon(key);
  if (neonValue !== null) return neonValue;

  const kvValue = await readFromKv(key);
  if (kvValue !== null) return kvValue;

  await ensureStorageFile();

  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed?.[key] === "string" ? parsed[key] : null;
  } catch (error) {
    console.error("Failed to read shared storage", error);
    return null;
  }
}

async function writeStorageValue(key: string, value: string) {
  if (await writeToNeon(key, value)) return;
  if (await writeToKv(key, value)) return;

  await ensureStorageFile();

  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const updated = typeof parsed === "object" && parsed !== null ? parsed : {};
    updated[key] = value;
    await fs.writeFile(STORAGE_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write shared storage", error);
  }
}

async function deleteStorageValue(key: string) {
  if (await deleteFromNeon(key)) return;
  if (await deleteFromKv(key)) return;

  await ensureStorageFile();

  try {
    const raw = await fs.readFile(STORAGE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && key in parsed) {
      delete parsed[key];
      await fs.writeFile(STORAGE_PATH, JSON.stringify(parsed, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to delete shared storage", error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const value = await readStorageValue(key);
  return NextResponse.json({ value });
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

  await writeStorageValue(key, value);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const key = typeof body.key === "string" ? body.key : undefined;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  await deleteStorageValue(key);

  return NextResponse.json({ ok: true });
}
