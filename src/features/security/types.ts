export type SecuritySeverity = "info" | "low" | "medium" | "high" | "critical";
export type SuspiciousSparksStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type AdminSecurityAccessState = "loading" | "allowed" | "denied" | "error";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type SecurityEventType =
  | "auth_failure"
  | "suspicious_init_data"
  | "rate_limit_exceeded"
  | "failed_purchase"
  | "failed_reward"
  | "duplicate_idempotency_attempt"
  | "insufficient_balance_attempt"
  | "reconciliation_drift"
  | "reward_quarantined"
  | "suspicious_sparks_flag"
  | "suspicious_journal_reward"
  | "admin_action"
  | "bot_command_rate_limited"
  | string;

export interface SecurityEvent {
  id: string;
  event_type: SecurityEventType;
  severity: SecuritySeverity;
  user_id: number | null;
  actor_user_id: number | null;
  endpoint: string | null;
  method: string | null;
  source: string | null;
  source_id: string | null;
  request_id: string | null;
  idempotency_key: string | null;
  details: Record<string, JsonValue>;
  created_at: string;
}

export interface SecurityEventsResponse {
  items: SecurityEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface SecuritySummary {
  window_hours?: number;
  total_events?: number;
  high_critical_events?: number;
  by_type?: Record<string, number>;
  by_severity?: Record<string, number>;
  open_suspicious_sparks_flags?: number;
  open_high_critical_suspicious_sparks_flags?: number;
  total_events_24h?: number;
  rate_limit_exceeded_24h?: number;
  bot_command_rate_limited_24h?: number;
  failed_purchase_24h?: number;
  failed_reward_24h?: number;
  insufficient_balance_attempt_24h?: number;
  suspicious_sparks_flag_24h?: number;
  reconciliation_drift_24h?: number;
  high_critical_events_24h?: number;
}

export interface SuspiciousSparksFlag {
  id: string;
  user_id: number;
  flag_type: string;
  severity: SecuritySeverity;
  source: string;
  source_id: string | null;
  details: Record<string, JsonValue>;
  status: SuspiciousSparksStatus;
  created_at: string;
  resolved_at: string | null;
  reviewed_by: number | null;
}

export interface SuspiciousSparksFlagsResponse {
  items: SuspiciousSparksFlag[];
  total: number;
  limit: number;
  offset: number;
}

export interface SecurityEventsParams {
  event_type?: string;
  severity?: SecuritySeverity | "";
  user_id?: number;
  source?: string;
  source_id?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  offset?: number;
}

export interface SuspiciousSparksFlagsParams {
  status?: SuspiciousSparksStatus | "";
  severity?: SecuritySeverity | "";
  flag_type?: string;
  user_id?: number;
  source?: string;
  created_from?: string;
  created_to?: string;
  limit?: number;
  offset?: number;
}
