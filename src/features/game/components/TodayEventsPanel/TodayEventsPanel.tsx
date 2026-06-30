import type { ReactNode } from "react";
import { Card } from "../../../../shared/ui/Card/Card";
import { Chip } from "../../../../shared/ui/Chip/Chip";
import "./TodayEventsPanel.css";

export interface TodayEventsPanelProps {
  items: Array<{ id: string; label: ReactNode; active?: boolean; tone?: "success" | "warning" | "info" }>;
}

export function TodayEventsPanel({ items }: TodayEventsPanelProps) {
  return (
    <Card className="today-events-panel" title="Сегодня">
      {items.map((item) => (
        <Chip key={item.id} selected={item.active} tone={item.tone ?? "info"}>
          {item.label}
        </Chip>
      ))}
    </Card>
  );
}
