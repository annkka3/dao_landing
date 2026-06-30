import type { JsonValue } from "./types";

const SENSITIVE_KEY_PARTS = [
  "authorization",
  "initdata",
  "init_data",
  "password",
  "private",
  "secret",
  "token",
  "api_key",
  "apikey",
  "key",
];

export function maskSensitiveDetails(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((item) => maskSensitiveDetails(item));
  if (value !== null && typeof value === "object") {
    const result: Record<string, JsonValue> = {};
    for (const [key, item] of Object.entries(value)) {
      const normalized = key.toLowerCase();
      result[key] = SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
        ? "[redacted]"
        : maskSensitiveDetails(item);
    }
    return result;
  }
  return value;
}

export function formatJsonPreview(value: JsonValue, maxLength = 120): string {
  const raw = JSON.stringify(maskSensitiveDetails(value));
  if (!raw) return "{}";
  return raw.length > maxLength ? `${raw.slice(0, maxLength - 1)}…` : raw;
}

export function formatJsonBlock(value: JsonValue, maxLength = 8_000): string {
  const raw = JSON.stringify(maskSensitiveDetails(value), null, 2) || "{}";
  return raw.length > maxLength
    ? `${raw.slice(0, maxLength)}\n… truncated`
    : raw;
}
