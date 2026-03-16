const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const relativeFormatters = new Map<string, Intl.RelativeTimeFormat>();

function getDateFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}-${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

export function formatDate(date: Date | string, locale: string = "es-ES"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return getDateFormatter(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatShortDate(date: Date | string, locale: string = "es-ES"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return getDateFormatter(locale, {
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRelativeTime(
  date: Date | string,
  locale: string = "es-ES"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let formatter = relativeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeFormatters.set(locale, formatter);
  }

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      return formatter.format(diffMinutes, "minute");
    }
    return formatter.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) {
    return formatter.format(diffDays, "day");
  }
  const diffMonths = Math.round(diffDays / 30);
  return formatter.format(diffMonths, "month");
}
