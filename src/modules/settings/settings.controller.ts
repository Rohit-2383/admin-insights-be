import { type Request, type Response } from "express";
import { asyncHandler } from "../../middlewares/error.middleware";
import { sendSuccess } from "../../utils/http";
import * as settingsService from "./settings.service";

const getAuthenticatedUser = (req: Request) => req.authUser!;
const getAccountId = (req: Request): string =>
  Array.isArray(req.params.accountId)
    ? (req.params.accountId[0] ?? "")
    : req.params.accountId ?? "";

export const getSettingsPageData = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Settings data fetched successfully.",
      settingsService.getSettingsPageData(getAuthenticatedUser(req)),
    );
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Profile updated successfully.",
      await settingsService.updateProfile(getAuthenticatedUser(req), req.body),
    );
  },
);

export const updateNotifications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Notification preferences updated successfully.",
      settingsService.updateNotifications(getAuthenticatedUser(req), req.body),
    );
  },
);

export const updateSecurity = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Security preferences updated successfully.",
      settingsService.updateSecurity(getAuthenticatedUser(req), req.body),
    );
  },
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Password updated successfully.",
      await settingsService.changePassword(getAuthenticatedUser(req), req.body),
    );
  },
);

export const updateConnectedAccount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Connected account updated successfully.",
      settingsService.updateConnectedAccount(
        getAuthenticatedUser(req),
        getAccountId(req),
        req.body,
      ),
    );
  },
);

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    sendSuccess(
      res,
      200,
      "Account deleted successfully.",
      await settingsService.deleteAccount(getAuthenticatedUser(req)),
    );
  },
);
