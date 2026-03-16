export const APP_NAME = "PokerGoat";

export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export const DEFAULT_CHIP_VALUE = 0.1;
export const DEFAULT_BUY_IN = 10;
export const DEFAULT_CURRENCY = "EUR";

export const MEMBER_ROLES = ["leader", "temporary_leader", "member"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export const NIGHT_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type NightStatus = (typeof NIGHT_STATUSES)[number];

export const REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const INVITE_CODE_LENGTH = 8;
