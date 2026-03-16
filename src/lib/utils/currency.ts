const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}-${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatCurrency(
  amount: number,
  locale: string = "es-ES",
  currency: string = "USD"
): string {
  return getFormatter(locale, currency).format(amount);
}

export function formatProfitLoss(
  amount: number,
  locale: string = "es-ES",
  currency: string = "USD"
): string {
  const formatted = formatCurrency(Math.abs(amount), locale, currency);
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}
