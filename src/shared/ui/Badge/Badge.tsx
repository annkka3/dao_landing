import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

export type BadgeTone = "default" | "success" | "warning" | "danger" | "rare" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

export function Badge({ tone = "default", icon, children, className, ...props }: BadgeProps) {
  return (
    <span className={["ui-badge", `ui-badge--${tone}`, className].filter(Boolean).join(" ")} {...props}>
      {icon}
      <span>{children}</span>
    </span>
  );
}
