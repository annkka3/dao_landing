import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Chip.css";

export type ChipTone = "default" | "success" | "warning" | "danger" | "rare" | "info";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ChipTone;
  selected?: boolean;
  icon?: ReactNode;
}

export function Chip({ tone = "default", selected = false, icon, children, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      className={["ui-chip", `ui-chip--${tone}`, selected && "ui-chip--selected", className].filter(Boolean).join(" ")}
      aria-pressed={selected}
      type={type}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
