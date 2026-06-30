import type { ReactNode } from "react";
import { archetypeAssets, type ArchetypeId, type ArchetypeMood } from "../../../../shared/assets/archetypeAssets";
import { Badge } from "../../../../shared/ui/Badge/Badge";
import { Button } from "../../../../shared/ui/Button/Button";
import { StatChangeList, type StatChangeItem } from "../StatChangeList/StatChangeList";
import "./ChoiceResultCard.css";

export type ChoiceResultTone = "positive" | "negative" | "mixed" | "rekt" | "bonus" | "missed";

export interface ChoiceResultCardProps {
  archetypeId: ArchetypeId;
  mood?: ArchetypeMood;
  title: ReactNode;
  summary: ReactNode;
  tone?: ChoiceResultTone;
  badge?: ReactNode;
  statChanges: StatChangeItem[];
  actionLabel?: string;
  onContinue?: () => void;
}

export function ChoiceResultCard({
  archetypeId,
  mood = "neutral",
  title,
  summary,
  tone = "mixed",
  badge,
  statChanges,
  actionLabel = "Продолжить",
  onContinue,
}: ChoiceResultCardProps) {
  return (
    <article className={`choice-result-card choice-result-card--${tone}`}>
      <div className="choice-result-card__art">
        <img src={archetypeAssets[archetypeId].cutout[mood]} alt="" />
      </div>
      <div className="choice-result-card__content">
        <header className="choice-result-card__header">
          <h2>{title}</h2>
          {badge && <Badge tone={tone === "positive" || tone === "bonus" ? "success" : tone === "negative" || tone === "rekt" ? "danger" : "warning"}>{badge}</Badge>}
        </header>
        <div className="choice-result-card__summary">{summary}</div>
        <StatChangeList items={statChanges} title="Влияние результата" />
        <Button fullWidth variant={tone === "rekt" || tone === "negative" ? "danger" : "primary"} onClick={onContinue}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
