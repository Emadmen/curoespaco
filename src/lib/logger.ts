/**
 * Minimal structured logger. Never pass personal data (names, phone numbers,
 * emails, appointment details) — only event names, ids and error codes.
 */
type SafeMeta = Record<string, string | number | boolean | null | undefined>;

function errorInfo(error: unknown) {
  if (error && typeof error === "object") {
    const e = error as { name?: string; code?: string };
    return { errorName: e.name ?? "Error", errorCode: e.code };
  }
  return { errorName: typeof error };
}

function write(level: "info" | "warn" | "error", event: string, meta?: SafeMeta, error?: unknown) {
  const entry = { level, event, ...meta, ...(error !== undefined ? errorInfo(error) : {}) };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, meta?: SafeMeta) => write("info", event, meta),
  warn: (event: string, meta?: SafeMeta, error?: unknown) => write("warn", event, meta, error),
  error: (event: string, meta?: SafeMeta, error?: unknown) => write("error", event, meta, error),
};
