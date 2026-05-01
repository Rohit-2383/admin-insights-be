const { Pool } = require("pg");
import { env } from "../config/env";

const resolveDatabaseUrl = (databaseUrl: string): string => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to connect to the database.");
  }

  if (!databaseUrl.startsWith("prisma+postgres://")) {
    return databaseUrl;
  }

  const parsedUrl = new URL(databaseUrl);
  const encodedApiKey = parsedUrl.searchParams.get("api_key");

  if (!encodedApiKey) {
    return databaseUrl;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(encodedApiKey, "base64url").toString("utf8"),
    ) as { databaseUrl?: string };

    return decodedPayload.databaseUrl ?? databaseUrl;
  } catch {
    return databaseUrl;
  }
};

const pool = new Pool({
  connectionString: resolveDatabaseUrl(env.databaseUrl),
});

let initializationPromise: Promise<void> | null = null;

export const db = pool;

export const initializeDatabase = async (): Promise<void> => {
  if (!initializationPromise) {
    initializationPromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          age INTEGER NOT NULL CHECK (age > 0),
          email VARCHAR(255) NOT NULL UNIQUE,
          location VARCHAR(255) NOT NULL,
          business_type VARCHAR(50) NOT NULL,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `)
      .then(() => undefined)
      .catch((error: unknown) => {
        initializationPromise = null;
        throw error;
      });
  }

  await initializationPromise;
};
