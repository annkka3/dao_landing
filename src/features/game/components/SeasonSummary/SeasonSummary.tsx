import { Card } from "../../../../shared/ui/Card/Card";
import "./SeasonSummary.css";

export interface SeasonSummaryProps {
  items: Array<{ label: string; value: string | number }>;
}

export function SeasonSummary({ items }: SeasonSummaryProps) {
  return (
    <Card className="season-summary" title="Итог сезона">
      {items.map((item) => (
        <div className="season-summary__item" key={item.label}>
          <span>{item.label}</span>
          <strong className="text-number">{item.value}</strong>
        </div>
      ))}
    </Card>
  );
}
