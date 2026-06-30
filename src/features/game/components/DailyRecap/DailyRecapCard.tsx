import { archetypeAssets, type ArchetypeId } from "../../../../shared/assets/archetypeAssets";
import { Button } from "../../../../shared/ui/Button/Button";
import { Card } from "../../../../shared/ui/Card/Card";
import { DailyNominations } from "./DailyNominations";
import { DailyStatSummary, type DailyStatSummaryItem } from "./DailyStatSummary";
import "./DailyRecap.css";

export interface DailyRecapCardProps {
  archetypeId: ArchetypeId;
  dayLabel: string;
  title: string;
  quote: string;
  summary: string;
  stats: DailyStatSummaryItem[];
  nominations: string[];
  onShare?: () => void;
}

export function DailyRecapCard({ archetypeId, dayLabel, title, quote, summary, stats, nominations, onShare }: DailyRecapCardProps) {
  return (
    <Card className="daily-recap-card" variant="elevated">
      <div className="daily-recap-card__hero">
        <img src={archetypeAssets[archetypeId].cutout.win} alt="" />
        <div>
          <span>{dayLabel}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <blockquote>{quote}</blockquote>
      <p>{summary}</p>
      <DailyStatSummary items={stats} />
      <DailyNominations items={nominations} />
      <Button fullWidth variant="secondary" onClick={onShare}>
        Поделиться итогом дня
      </Button>
    </Card>
  );
}
