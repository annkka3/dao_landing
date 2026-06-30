import type { ReactNode } from "react";
import type { EquippedItem } from "../types";
import "../styles/equippedItems.css";

export function EquippedMarketBadge({
  label,
  item,
  emptyText,
  action,
}: {
  label: string;
  item: EquippedItem | null;
  emptyText?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`equipped-market-badge${item ? " equipped-market-badge--active" : ""}`}>
      <span>{label}</span>
      <strong>{item?.item.title ?? emptyText ?? "Не применено"}</strong>
      {action}
    </div>
  );
}
