import { ApiError, type ApiErrorBody } from "./errors";
import { getTelegramInitData } from "../telegram/webapp";

type ViteEnv = { VITE_API_BASE_URL?: string };

const API_BASE =
  (import.meta as unknown as { env: ViteEnv }).env.VITE_API_BASE_URL ?? "/api/v1";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { idempotencyKey?: string }
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("X-Request-Id", uuid());

  const initData = getTelegramInitData();
  if (initData) {
    headers.set("Authorization", `tma ${initData}`);
  }

  if (init?.idempotencyKey) {
    headers.set("Idempotency-Key", init.idempotencyKey);
  }

  const { idempotencyKey: _ik, ...fetchInit } = init ?? {};
  const response = await fetch(API_BASE + path, { ...fetchInit, headers });

  if (!response.ok) {
    let body: ApiErrorBody;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      throw new ApiError(response.status, {
        error: { code: "UNKNOWN_ERROR", message: response.statusText, details: null },
        request_id: "",
      });
    }
    if (!body?.error) {
      const raw = body as unknown as { code?: string; message?: string; request_id?: string };
      body = {
        error: {
          code: raw.code ?? "UNKNOWN_ERROR",
          message: raw.message ?? response.statusText,
          details: raw,
        },
        request_id: raw.request_id ?? "",
      };
    }
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as T;
}
