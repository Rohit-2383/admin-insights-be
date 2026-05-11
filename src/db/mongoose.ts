import mongoose from "mongoose";
import { env, isProduction } from "../config/env";

mongoose.set("strictQuery", true);

const maskUri = (uri: string): string =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(env.mongoUri, {
    autoIndex: !isProduction,
    serverSelectionTimeoutMS: 10_000,
  });

  console.log(`[db] connected to ${maskUri(env.mongoUri)}`);
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};
