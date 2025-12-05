const isProduction = process.env.NODE_ENV === "production";

const requireEnv = (name: string, fallback?: string) => {
  const value = process.env[name];

  if (value) return value;

  if (isProduction || fallback === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  console.warn(`[env] Using development fallback for ${name}. Set it in your .env.local to override.`);
  return fallback;
};

const devDefaults = {
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "admin123",
  SESSION_SECRET: "dev-secret-change-me",
};

export const authConfig = {
  adminUsername: requireEnv("ADMIN_USERNAME", devDefaults.ADMIN_USERNAME),
  adminPassword: requireEnv("ADMIN_PASSWORD", devDefaults.ADMIN_PASSWORD),
  sessionSecret: requireEnv("SESSION_SECRET", devDefaults.SESSION_SECRET),
};
