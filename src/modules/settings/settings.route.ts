import { Router } from "express";
import {
  changePassword,
  deleteAccount,
  getSettingsPageData,
  updateConnectedAccount,
  updateNotifications,
  updateProfile,
  updateSecurity,
} from "./settings.controller";

const settingsRouter = Router();

settingsRouter.get("/", getSettingsPageData);
settingsRouter.patch("/profile", updateProfile);
settingsRouter.patch("/notifications", updateNotifications);
settingsRouter.patch("/security", updateSecurity);
settingsRouter.patch("/password", changePassword);
settingsRouter.patch("/connected-accounts/:accountId", updateConnectedAccount);
settingsRouter.delete("/account", deleteAccount);

export default settingsRouter;
