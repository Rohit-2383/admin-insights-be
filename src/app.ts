import cors from "cors";
import express, { type Request, type Response } from "express";
import { requireAuth } from "./middlewares/auth.middleware";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";
import analyticsRouter from "./modules/analytics/analytics.route";
import authRouter from "./modules/auth/auth.route";
import ordersRouter from "./modules/orders/orders.route";
import overviewRouter from "./modules/overview/overview.route";
import productsRouter from "./modules/products/products.route";
import salesRouter from "./modules/sales/sales.route";
import settingsRouter from "./modules/settings/settings.route";
import usersRouter from "./modules/users/users.route";

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
app.use("/api/overview", requireAuth, overviewRouter);
app.use("/api/products", requireAuth, productsRouter);
app.use("/api/users", requireAuth, usersRouter);
app.use("/api/sales", requireAuth, salesRouter);
app.use("/api/orders", requireAuth, ordersRouter);
app.use("/api/analytics", requireAuth, analyticsRouter);
app.use("/api/settings", requireAuth, settingsRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
