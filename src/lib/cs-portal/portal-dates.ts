/**
 * Sony ownership dates are Bangkok wall-clock without a timezone offset.
 * Always interpret them as Asia/Bangkok so formatting does not depend on
 * the Node/server local timezone (e.g. US hosts shifting 29 Oct → 30 Oct).
 */
export function parseSonyPortalDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const date = new Date(`${trimmed}T00:00:00+07:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const sonyLocal =
    /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(trimmed);
  if (sonyLocal) {
    const date = new Date(
      `${sonyLocal[1]}T${sonyLocal[2]}:${sonyLocal[3]}:${sonyLocal[4]}+07:00`,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      trimmed,
    )
  ) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatPortalDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = parseSonyPortalDate(value);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}
