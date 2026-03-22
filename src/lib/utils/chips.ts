export function calculateTotalInvested(
  buyInAmount: number,
  rebuyTotal: number
): number {
  return buyInAmount + rebuyTotal;
}

export interface NightChipValues {
  black: number;
  white: number;
  red: number;
  green: number;
  blue: number;
}

export interface NightChipBreakdown {
  black: number;
  white: number;
  red: number;
  green: number;
  blue: number;
}

export interface NightMetadata {
  chipValues: NightChipValues;
  chipQuantities?: NightChipValues;
  notes?: string;
}

export function calculateCashout(
  totalChipsEnd: number,
  chipValue: number
): number {
  return totalChipsEnd * chipValue;
}

export function calculateCashoutFromChipBreakdown(
  chipBreakdown: NightChipBreakdown,
  chipValues: NightChipValues
): number {
  return (
    chipBreakdown.black * chipValues.black +
    chipBreakdown.white * chipValues.white +
    chipBreakdown.red * chipValues.red +
    chipBreakdown.green * chipValues.green +
    chipBreakdown.blue * chipValues.blue
  );
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
  chipValues: NightChipValues,
  chipQuantities?: NightChipValues
): string {
  const payload: NightMetadata = {
    chipValues,
    ...(chipQuantities ? { chipQuantities } : {}),
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
    const result: NightMetadata = {
      chipValues: values,
      ...(parsed.notes ? { notes: parsed.notes } : {}),
    };
    if (
      parsed.chipQuantities &&
      typeof parsed.chipQuantities.black === "number" &&
      typeof parsed.chipQuantities.white === "number" &&
      typeof parsed.chipQuantities.red === "number" &&
      typeof parsed.chipQuantities.green === "number" &&
      typeof parsed.chipQuantities.blue === "number"
    ) {
      result.chipQuantities = parsed.chipQuantities;
    }
    return result;
  } catch {
    return fallback;
  }
}

export interface ChipReconciliation {
  perColor: Array<{
    color: keyof NightChipValues;
    expected: number;
    reported: number;
    difference: number;
  }>;
  isBalanced: boolean;
  totalExpectedValue: number;
  totalReportedValue: number;
  valueDifference: number;
}

export function calculateReconciliation(
  chipQuantities: NightChipValues,
  chipValues: NightChipValues,
  participants: Array<{
    buyInCount: number;
    chipsBlackEnd: number | null;
    chipsWhiteEnd: number | null;
    chipsRedEnd: number | null;
    chipsGreenEnd: number | null;
    chipsBlueEnd: number | null;
  }>
): ChipReconciliation {
  const totalBuyIns = participants.reduce((sum, p) => sum + p.buyInCount, 0);
  const colors: Array<keyof NightChipValues> = ["black", "white", "red", "green", "blue"];
  const colorToField = {
    black: "chipsBlackEnd",
    white: "chipsWhiteEnd",
    red: "chipsRedEnd",
    green: "chipsGreenEnd",
    blue: "chipsBlueEnd",
  } as const;

  let totalExpectedValue = 0;
  let totalReportedValue = 0;

  const perColor = colors.map((color) => {
    const expected = totalBuyIns * chipQuantities[color];
    const reported = participants.reduce(
      (sum, p) => sum + (p[colorToField[color]] ?? 0),
      0
    );
    const difference = reported - expected;
    totalExpectedValue += expected * chipValues[color];
    totalReportedValue += reported * chipValues[color];
    return { color, expected, reported, difference };
  });

  return {
    perColor,
    isBalanced: perColor.every((c) => c.difference === 0),
    totalExpectedValue,
    totalReportedValue,
    valueDifference: totalReportedValue - totalExpectedValue,
  };
}

export function allParticipantsHaveChips(
  participants: Array<{
    chipsBlackEnd: number | null;
    chipsWhiteEnd: number | null;
    chipsRedEnd: number | null;
    chipsGreenEnd: number | null;
    chipsBlueEnd: number | null;
  }>
): boolean {
  return participants.every(
    (p) =>
      p.chipsBlackEnd !== null &&
      p.chipsWhiteEnd !== null &&
      p.chipsRedEnd !== null &&
      p.chipsGreenEnd !== null &&
      p.chipsBlueEnd !== null
  );
}
