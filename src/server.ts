import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./db/mongoose";

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(
      `[server] listening on http://localhost:${env.port} (${env.nodeEnv})`,
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] received ${signal}, shutting down...`);
    server.close(() => console.log("[server] http closed"));
    await disconnectDatabase();
    console.log("[server] db closed");
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

bootstrap().catch((error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
