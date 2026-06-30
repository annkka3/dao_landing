function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Generate a fresh idempotency key for one user-initiated action.
 * Call once per button click and pass the result to the mutation.
 * Do NOT regenerate on low-level retries — reuse the same key.
 */
export function createIdempotencyKey(_operation?: string): string {
  return uuid();
}
