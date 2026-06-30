import { Badge } from "../../../../shared/ui/Badge/Badge";
import "./DailyRecap.css";

export interface DailyNominationsProps {
  items: string[];
}

export function DailyNominations({ items }: DailyNominationsProps) {
  return (
    <div className="daily-nominations">
      {items.map((item) => (
        <Badge key={item} tone="warning">
          {item}
        </Badge>
      ))}
    </div>
  );
}
