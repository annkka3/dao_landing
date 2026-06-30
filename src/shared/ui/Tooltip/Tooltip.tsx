import type { ReactNode } from "react";
import "./Tooltip.css";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  return (
    <span className={`ui-tooltip ui-tooltip--${side}`}>
      {children}
      <span className="ui-tooltip__bubble" role="tooltip">
        {content}
      </span>
    </span>
  );
}
