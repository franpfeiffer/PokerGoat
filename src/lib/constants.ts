export const APP_NAME = "PokerGoat";

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const DEFAULT_CHIP_VALUE = 0.1;
export const DEFAULT_BUY_IN = 5000;
export const DEFAULT_CURRENCY = "ARS";

export const MEMBER_ROLES = ["leader", "temporary_leader", "member"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const NIGHT_STATARES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type NightStatus = (typeof NIGHT_STATARES)[number];

export const REQUEST_STATARES = ["pending", "approved", "rejected"] as const;
export type RequestStatus = (typeof REQUEST_STATARES)[number];

export const INVITE_CODE_LENGTH = 8;
