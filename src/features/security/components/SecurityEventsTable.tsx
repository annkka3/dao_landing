import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../api/errors";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import { getSecurityEvents, securityKeys } from "../api";
import { formatJsonPreview } from "../masking";
import type { SecurityEvent, SecurityEventsParams, SecuritySeverity } from "../types";
import { SecurityDetailsDrawer } from "./SecurityDetailsDrawer";
import { SecurityFilters } from "./SecurityFilters";
import { SecurityStatusBadge } from "./SecurityStatusBadge";

const PAGE_LIMIT = 50;

export function SecurityEventsTable() {
  const [eventType, setEventType] = useState("");
  const [severity, setSeverity] = useState<SecuritySeverity | "">("");
  const [userId, setUserId] = useState("");
  const [source, setSource] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<SecurityEvent | null>(null);

  const params = useMemo<SecurityEventsParams>(() => ({
    event_type: eventType.trim() || undefined,
    severity,
    user_id: userId ? Number(userId) : undefined,
    source: source.trim() || undefined,
    limit: PAGE_LIMIT,
    offset,
  }), [eventType, offset, severity, source, userId]);

  const query = useQuery({
    queryKey: securityKeys.events(params),
    queryFn: () => getSecurityEvents(params),
  });

  function resetFilters() {
    setEventType("");
    setSeverity("");
    setUserId("");
    setSource("");
    setOffset(0);
  }

  const total = query.data?.total ?? 0;
  const canPrev = offset > 0;
  const canNext = offset + PAGE_LIMIT < total;

  return (
    <section className="security-panel">
      <div className="security-section-head">
        <div>
          <span>Security Events</span>
          <h2>Event stream</h2>
        </div>
        <button type="button" onClick={() => void query.refetch()}>Refresh</button>
      </div>

      <SecurityFilters
        mode="events"
        eventType={eventType}
        severity={severity}
        userId={userId}
        source={source}
        onEventTypeChange={(value) => { setEventType(value); setOffset(0); }}
        onSeverityChange={(value) => { setSeverity(value); setOffset(0); }}
        onUserIdChange={(value) => { setUserId(value); setOffset(0); }}
        onSourceChange={(value) => { setSource(value); setOffset(0); }}
        onReset={resetFilters}
      />

      {query.isError ? (
        <SecurityTableError error={query.error} />
      ) : (
        <>
          <div className="security-table-wrap">
            <table className="security-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Source</th>
                  <th>Endpoint</th>
                  <th>Details</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <tr><td colSpan={8}>Loading security events...</td></tr>
                ) : (query.data?.items ?? []).length === 0 ? (
                  <tr><td colSpan={8}>No events for selected filters.</td></tr>
                ) : (
                  query.data!.items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td><SecurityStatusBadge value={item.severity} /></td>
                      <td className="security-table__strong">{item.event_type}</td>
                      <td>{item.user_id ?? "—"}</td>
                      <td>{formatSource(item.source, item.source_id)}</td>
                      <td>{formatEndpoint(item.method, item.endpoint)}</td>
                      <td className="security-table__details">{formatJsonPreview(item.details)}</td>
                      <td>
                        <button type="button" onClick={() => setSelected(item)}>Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            total={total}
            offset={offset}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => setOffset(Math.max(0, offset - PAGE_LIMIT))}
            onNext={() => setOffset(offset + PAGE_LIMIT)}
          />
        </>
      )}

      <SecurityDetailsDrawer
        open={Boolean(selected)}
        title={selected?.event_type ?? "Security event"}
        subtitle={selected ? formatDate(selected.created_at) : undefined}
        rows={selected ? [
          { label: "ID", value: selected.id },
          { label: "Severity", value: <SecurityStatusBadge value={selected.severity} /> },
          { label: "User", value: selected.user_id ?? "—" },
          { label: "Actor", value: selected.actor_user_id ?? "—" },
          { label: "Source", value: formatSource(selected.source, selected.source_id) },
          { label: "Endpoint", value: formatEndpoint(selected.method, selected.endpoint) },
          { label: "Request", value: selected.request_id ?? "—" },
        ] : []}
        details={selected?.details ?? {}}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

export function SecurityTableError({ error }: { error: unknown }) {
  const accessDenied = ApiError.isApiError(error) && error.status === 403;
  return (
    <div className="security-error">
      <strong>{accessDenied ? "Access denied" : "Unable to load data"}</strong>
      <p>
        {accessDenied
          ? "Этот раздел доступен только администраторам безопасности."
          : friendlyErrorMessage(error)}
      </p>
    </div>
  );
}

function Pagination({
  total,
  offset,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  total: number;
  offset: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="security-pagination">
      <span>{total === 0 ? "0" : `${offset + 1}-${Math.min(offset + PAGE_LIMIT, total)}`} / {total}</span>
      <div>
        <button type="button" disabled={!canPrev} onClick={onPrev}>Prev</button>
        <button type="button" disabled={!canNext} onClick={onNext}>Next</button>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatEndpoint(method: string | null, endpoint: string | null): string {
  if (!method && !endpoint) return "—";
  return [method, endpoint].filter(Boolean).join(" ");
}

function formatSource(source: string | null, sourceId: string | null): string {
  if (!source && !sourceId) return "—";
  return sourceId ? `${source ?? "source"}:${sourceId}` : source ?? "—";
}
