import { Schema, Types, model, type HydratedDocument, type Model } from "mongoose";

export interface SettingsProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  avatarUrl: string;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
}

export interface ConnectedAccount {
  id: number;
  name: string;
  connected: boolean;
  icon: string;
}

export interface UserSettingsAttrs {
  user: Types.ObjectId;
  profile: SettingsProfile;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  connectedAccounts: ConnectedAccount[];
}

export type UserSettingsDocument = HydratedDocument<UserSettingsAttrs>;
export type UserSettingsModelType = Model<UserSettingsAttrs>;

const profileSchema = new Schema<SettingsProfile>(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    role: { type: String, default: "Administrator" },
    location: { type: String, default: "" },
    avatarUrl: {
      type: String,
      default: "https://randomuser.me/api/portraits/men/3.jpg",
    },
  },
  { _id: false },
);

const notificationSchema = new Schema<NotificationPreferences>(
  {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: true },
  },
  { _id: false },
);

const securitySchema = new Schema<SecurityPreferences>(
  {
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { _id: false },
);

const connectedAccountSchema = new Schema<ConnectedAccount>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    connected: { type: Boolean, default: false },
    icon: { type: String, default: "" },
  },
  { _id: false },
);

export const DEFAULT_CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  { id: 1, name: "Google", connected: true, icon: "/google.png" },
  { id: 2, name: "Facebook", connected: false, icon: "/facebook.svg" },
  { id: 3, name: "Twitter", connected: true, icon: "/x.png" },
];

const userSettingsSchema = new Schema<UserSettingsAttrs>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      unique: true,
      index: true,
    },
    profile: { type: profileSchema, default: () => ({}) },
    notifications: { type: notificationSchema, default: () => ({}) },
    security: { type: securitySchema, default: () => ({}) },
    connectedAccounts: {
      type: [connectedAccountSchema],
      default: () => DEFAULT_CONNECTED_ACCOUNTS,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.user;
        return ret;
      },
    },
  },
);

export const UserSettingsModel = model<UserSettingsAttrs>(
  "UserSettings",
  userSettingsSchema,
);
