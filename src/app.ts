import cors from "cors";
import express, { type Request, type Response } from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";
import authRouter from "./modules/auth/auth.route";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});

app.use("/api/auth", authRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
