export function calculateTotalInvested(
  buyInCount: number,
  buyInAmount: number
): number {
  return buyInCount * buyInAmount;
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
