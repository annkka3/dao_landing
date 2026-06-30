import type { SecuritySeverity, SuspiciousSparksStatus } from "../types";

type Props = {
  value: SecuritySeverity | SuspiciousSparksStatus | string;
  tone?: "severity" | "status";
};

export function SecurityStatusBadge({ value, tone = "severity" }: Props) {
  return (
    <span className={`security-badge security-badge--${tone} security-badge--${value}`}>
      {value}
    </span>
  );
}
