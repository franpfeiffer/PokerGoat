export function calculateTotalInvested(
  buyInCount: number,
  buyInAmount: number
): number {
  return buyInCount * buyInAmount;
}

export interface NightChipValues {
  black: number;
  white: number;
  red: number;
  green: number;
  blue: number;
}

interface NightMetadata {
  chipValues: NightChipValues;
  notes?: string;
}

export function calculateCashout(
  totalChipsEnd: number,
  chipValue: number
): number {
  return totalChipsEnd * chipValue;
}

export function calculateProfitLoss(
  cashout: number,
  totalInvested: number
): number {
  return Number((cashout - totalInvested).toFixed(2));
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export function serializeNightMetadata(
  notes: string | undefined,
  chipValues: NightChipValues
): string {
  const payload: NightMetadata = {
    chipValues,
    ...(notes ? { notes } : {}),
  };
  return JSON.stringify(payload);
}

export function parseNightMetadata(
  rawNotes: string | null | undefined,
  fallbackChipValue: number
): NightMetadata {
  const fallback: NightMetadata = {
    chipValues: {
      black: fallbackChipValue,
      white: fallbackChipValue,
      red: fallbackChipValue,
      green: fallbackChipValue,
      blue: fallbackChipValue,
    },
    ...(rawNotes ? { notes: rawNotes } : {}),
  };

  if (!rawNotes) return fallback;

  try {
    const parsed = JSON.parse(rawNotes) as Partial<NightMetadata>;
    if (!parsed.chipValues) return fallback;
    const values = parsed.chipValues;
    if (
      typeof values.black !== "number" ||
      typeof values.white !== "number" ||
      typeof values.red !== "number" ||
      typeof values.green !== "number" ||
      typeof values.blue !== "number"
    ) {
      return fallback;
    }
    return {
      chipValues: values,
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    };
  } catch {
    return fallback;
  }
}
