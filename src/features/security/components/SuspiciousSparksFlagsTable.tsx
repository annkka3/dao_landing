import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { friendlyErrorMessage } from "../../../api/errorMessages";
import { notifyError, notifySuccess } from "../../../shared/notifications/notify";
import {
  dismissSuspiciousSparksFlag,
  getSuspiciousSparksFlags,
  resolveSuspiciousSparksFlag,
  reviewSuspiciousSparksFlag,
  securityKeys,
} from "../api";
import { formatJsonPreview } from "../masking";
import type { SecuritySeverity, SuspiciousSparksFlag, SuspiciousSparksFlagsParams, SuspiciousSparksStatus } from "../types";
import { SecurityDetailsDrawer } from "./SecurityDetailsDrawer";
import { SecurityFilters } from "./SecurityFilters";
import { SecurityStatusBadge } from "./SecurityStatusBadge";
import { SecurityTableError } from "./SecurityEventsTable";

const PAGE_LIMIT = 50;

export function SuspiciousSparksFlagsTable() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SuspiciousSparksStatus | "">("open");
  const [flagType, setFlagType] = useState("");
  const [severity, setSeverity] = useState<SecuritySeverity | "">("");
  const [userId, setUserId] = useState("");
  const [source, setSource] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<SuspiciousSparksFlag | null>(null);

  const params = useMemo<SuspiciousSparksFlagsParams>(() => ({
    status,
    flag_type: flagType.trim() || undefined,
    severity,
    user_id: userId ? Number(userId) : undefined,
    source: source.trim() || undefined,
    limit: PAGE_LIMIT,
    offset,
  }), [flagType, offset, severity, source, status, userId]);

  const query = useQuery({
    queryKey: securityKeys.flags(params),
    queryFn: () => getSuspiciousSparksFlags(params),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "review" | "resolve" | "dismiss" }) => {
      if (action === "review") return reviewSuspiciousSparksFlag(id);
      if (action === "resolve") return resolveSuspiciousSparksFlag(id);
      return dismissSuspiciousSparksFlag(id);
    },
    onSuccess: async (_result, variables) => {
      notifySuccess("Flag updated", `Status changed: ${variables.action}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["security", "flags"] }),
        queryClient.invalidateQueries({ queryKey: securityKeys.summary }),
      ]);
      setSelected(null);
    },
    onError: (error) => {
      notifyError("Unable to update flag", friendlyErrorMessage(error));
    },
  });

  function resetFilters() {
    setStatus("open");
    setFlagType("");
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
          <span>Suspicious Sparks</span>
          <h2>Flags review queue</h2>
        </div>
        <button type="button" onClick={() => void query.refetch()}>Refresh</button>
      </div>

      <SecurityFilters
        mode="flags"
        status={status}
        flagType={flagType}
        severity={severity}
        userId={userId}
        source={source}
        onStatusChange={(value) => { setStatus(value); setOffset(0); }}
        onFlagTypeChange={(value) => { setFlagType(value); setOffset(0); }}
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
            <table className="security-table security-table--flags">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Source</th>
                  <th>Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading ? (
                  <tr><td colSpan={8}>Loading suspicious flags...</td></tr>
                ) : (query.data?.items ?? []).length === 0 ? (
                  <tr><td colSpan={8}>No flags for selected filters.</td></tr>
                ) : (
                  query.data!.items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td><SecurityStatusBadge value={item.status} tone="status" /></td>
                      <td><SecurityStatusBadge value={item.severity} /></td>
                      <td className="security-table__strong">{item.flag_type}</td>
                      <td>{item.user_id}</td>
                      <td>{formatSource(item.source, item.source_id)}</td>
                      <td className="security-table__details">{formatJsonPreview(item.details)}</td>
                      <td>
                        <div className="security-actions">
                          <button type="button" onClick={() => setSelected(item)}>Details</button>
                          {item.status === "open" && (
                            <button
                              type="button"
                              disabled={transitionMutation.isPending}
                              onClick={() => transitionMutation.mutate({ id: item.id, action: "review" })}
                            >
                              Review
                            </button>
                          )}
                          {(item.status === "open" || item.status === "reviewing") && (
                            <>
                              <button
                                type="button"
                                disabled={transitionMutation.isPending}
                                onClick={() => transitionMutation.mutate({ id: item.id, action: "resolve" })}
                              >
                                Resolve
                              </button>
                              <button
                                type="button"
                                disabled={transitionMutation.isPending}
                                onClick={() => transitionMutation.mutate({ id: item.id, action: "dismiss" })}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="security-pagination">
            <span>{total === 0 ? "0" : `${offset + 1}-${Math.min(offset + PAGE_LIMIT, total)}`} / {total}</span>
            <div>
              <button type="button" disabled={!canPrev} onClick={() => setOffset(Math.max(0, offset - PAGE_LIMIT))}>Prev</button>
              <button type="button" disabled={!canNext} onClick={() => setOffset(offset + PAGE_LIMIT)}>Next</button>
            </div>
          </div>
        </>
      )}

      <SecurityDetailsDrawer
        open={Boolean(selected)}
        title={selected?.flag_type ?? "Suspicious Sparks flag"}
        subtitle={selected ? formatDate(selected.created_at) : undefined}
        rows={selected ? [
          { label: "ID", value: selected.id },
          { label: "Status", value: <SecurityStatusBadge value={selected.status} tone="status" /> },
          { label: "Severity", value: <SecurityStatusBadge value={selected.severity} /> },
          { label: "User", value: selected.user_id },
          { label: "Source", value: formatSource(selected.source, selected.source_id) },
          { label: "Reviewed by", value: selected.reviewed_by ?? "—" },
          { label: "Resolved at", value: selected.resolved_at ? formatDate(selected.resolved_at) : "—" },
        ] : []}
        details={selected?.details ?? {}}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatSource(source: string | null, sourceId: string | null): string {
  if (!source && !sourceId) return "—";
  return sourceId ? `${source ?? "source"}:${sourceId}` : source ?? "—";
}
