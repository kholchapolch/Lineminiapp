export const LINE_UUID_STORAGE_KEY = "sony_line_uuid";

export function readStoredLineUuid(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(LINE_UUID_STORAGE_KEY);
}

export function storeLineUuid(lineUuid: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(LINE_UUID_STORAGE_KEY, lineUuid);
}

export function clearStoredLineUuid(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(LINE_UUID_STORAGE_KEY);
}
