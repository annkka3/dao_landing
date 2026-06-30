import type { ReactNode } from "react";
import { formatJsonBlock } from "../masking";
import type { JsonValue } from "../types";

export interface SecurityDetailsRow {
  label: string;
  value: ReactNode;
}

interface SecurityDetailsDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  rows: SecurityDetailsRow[];
  details: JsonValue;
  onClose: () => void;
}

export function SecurityDetailsDrawer({
  open,
  title,
  subtitle,
  rows,
  details,
  onClose,
}: SecurityDetailsDrawerProps) {
  if (!open) return null;

  return (
    <div className="security-drawer" role="dialog" aria-modal="true" aria-label={title}>
      <button className="security-drawer__backdrop" type="button" aria-label="Закрыть" onClick={onClose} />
      <aside className="security-drawer__panel">
        <div className="security-drawer__head">
          <div>
            <span className="security-drawer__eyebrow">Security details</span>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="security-drawer__close" type="button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <dl className="security-drawer__meta">
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value || "—"}</dd>
            </div>
          ))}
        </dl>

        <section className="security-drawer__json">
          <h3>Masked details</h3>
          <pre>{formatJsonBlock(details)}</pre>
        </section>
      </aside>
    </div>
  );
}
