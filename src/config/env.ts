import "dotenv/config";

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

export const env = {
  port: parseNumber(process.env.PORT, 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  authTokenSecret:
    process.env.AUTH_TOKEN_SECRET ?? "local-auth-secret-change-me",
  authTokenTtlMs: parseNumber(
    process.env.AUTH_TOKEN_TTL_MS,
    1000 * 60 * 60 * 24 * 7,
  ),
};
