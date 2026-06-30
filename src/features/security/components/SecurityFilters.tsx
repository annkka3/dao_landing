import type { SecuritySeverity, SuspiciousSparksStatus } from "../types";

type SecurityFilterMode = "events" | "flags";

interface SecurityFiltersProps {
  mode: SecurityFilterMode;
  eventType?: string;
  flagType?: string;
  severity: SecuritySeverity | "";
  status?: SuspiciousSparksStatus | "";
  userId: string;
  source: string;
  onEventTypeChange?: (value: string) => void;
  onFlagTypeChange?: (value: string) => void;
  onSeverityChange: (value: SecuritySeverity | "") => void;
  onStatusChange?: (value: SuspiciousSparksStatus | "") => void;
  onUserIdChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onReset: () => void;
}

const severities: Array<SecuritySeverity | ""> = ["", "info", "low", "medium", "high", "critical"];
const statuses: Array<SuspiciousSparksStatus | ""> = ["", "open", "reviewing", "resolved", "dismissed"];

export function SecurityFilters({
  mode,
  eventType = "",
  flagType = "",
  severity,
  status = "",
  userId,
  source,
  onEventTypeChange,
  onFlagTypeChange,
  onSeverityChange,
  onStatusChange,
  onUserIdChange,
  onSourceChange,
  onReset,
}: SecurityFiltersProps) {
  return (
    <section className="security-filters" aria-label="Security filters">
      {mode === "events" ? (
        <label>
          <span>Event type</span>
          <input
            value={eventType}
            onChange={(event) => onEventTypeChange?.(event.target.value)}
            placeholder="failed_purchase"
          />
        </label>
      ) : (
        <>
          <label>
            <span>Status</span>
            <select value={status} onChange={(event) => onStatusChange?.(event.target.value as SuspiciousSparksStatus | "")}>
              {statuses.map((item) => (
                <option key={item || "all"} value={item}>{item || "all"}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Flag type</span>
            <input
              value={flagType}
              onChange={(event) => onFlagTypeChange?.(event.target.value)}
              placeholder="reward_velocity_high"
            />
          </label>
        </>
      )}

      <label>
        <span>Severity</span>
        <select value={severity} onChange={(event) => onSeverityChange(event.target.value as SecuritySeverity | "")}>
          {severities.map((item) => (
            <option key={item || "all"} value={item}>{item || "all"}</option>
          ))}
        </select>
      </label>

      <label>
        <span>User ID</span>
        <input
          inputMode="numeric"
          value={userId}
          onChange={(event) => onUserIdChange(event.target.value.replace(/[^\d]/g, ""))}
          placeholder="123"
        />
      </label>

      <label>
        <span>Source</span>
        <input value={source} onChange={(event) => onSourceChange(event.target.value)} placeholder="market_purchase" />
      </label>

      <button className="security-filters__reset" type="button" onClick={onReset}>
        Reset
      </button>
    </section>
  );
}
