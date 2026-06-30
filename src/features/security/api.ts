import { apiFetch } from "../../api/client";
import type {
  SecurityEvent,
  SecurityEventsParams,
  SecurityEventsResponse,
  SecuritySummary,
  SuspiciousSparksFlag,
  SuspiciousSparksFlagsParams,
  SuspiciousSparksFlagsResponse,
} from "./types";

const BASE = "/admin/security";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const raw = query.toString();
  return raw ? `?${raw}` : "";
}

export function getSecuritySummary(): Promise<SecuritySummary> {
  return apiFetch<SecuritySummary>(`${BASE}/summary`);
}

export function getSecurityEvents(
  params?: SecurityEventsParams
): Promise<SecurityEventsResponse> {
  return apiFetch<SecurityEventsResponse>(
    `${BASE}/events${buildQuery({
      event_type: params?.event_type,
      severity: params?.severity,
      user_id: params?.user_id,
      source: params?.source,
      source_id: params?.source_id,
      created_from: params?.created_from,
      created_to: params?.created_to,
      limit: params?.limit,
      offset: params?.offset,
    })}`
  );
}

export function getSecurityEvent(eventId: string): Promise<SecurityEvent> {
  return apiFetch<SecurityEvent>(`${BASE}/events/${encodeURIComponent(eventId)}`);
}

export function getSuspiciousSparksFlags(
  params?: SuspiciousSparksFlagsParams
): Promise<SuspiciousSparksFlagsResponse> {
  return apiFetch<SuspiciousSparksFlagsResponse>(
    `${BASE}/suspicious-sparks${buildQuery({
      status: params?.status,
      severity: params?.severity,
      flag_type: params?.flag_type,
      user_id: params?.user_id,
      source: params?.source,
      created_from: params?.created_from,
      created_to: params?.created_to,
      limit: params?.limit,
      offset: params?.offset,
    })}`
  );
}

export function getSuspiciousSparksFlag(flagId: string): Promise<SuspiciousSparksFlag> {
  return apiFetch<SuspiciousSparksFlag>(`${BASE}/suspicious-sparks/${encodeURIComponent(flagId)}`);
}

export function reviewSuspiciousSparksFlag(flagId: string): Promise<{ item: SuspiciousSparksFlag }> {
  return apiFetch<{ item: SuspiciousSparksFlag }>(
    `${BASE}/suspicious-sparks/${encodeURIComponent(flagId)}/review`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function resolveSuspiciousSparksFlag(flagId: string): Promise<{ item: SuspiciousSparksFlag }> {
  return apiFetch<{ item: SuspiciousSparksFlag }>(
    `${BASE}/suspicious-sparks/${encodeURIComponent(flagId)}/resolve`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function dismissSuspiciousSparksFlag(flagId: string): Promise<{ item: SuspiciousSparksFlag }> {
  return apiFetch<{ item: SuspiciousSparksFlag }>(
    `${BASE}/suspicious-sparks/${encodeURIComponent(flagId)}/dismiss`,
    { method: "POST", body: JSON.stringify({}) }
  );
}

export const securityKeys = {
  summary: ["security", "summary"] as const,
  events: (params: SecurityEventsParams) => ["security", "events", params] as const,
  flags: (params: SuspiciousSparksFlagsParams) => ["security", "flags", params] as const,
};
