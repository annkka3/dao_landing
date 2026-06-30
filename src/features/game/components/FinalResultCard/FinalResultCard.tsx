import type { ReactNode } from "react";
import { archetypeAssets, type ArchetypeId, type ArchetypeMood } from "../../../../shared/assets/archetypeAssets";
import { Badge } from "../../../../shared/ui/Badge/Badge";
import { Button } from "../../../../shared/ui/Button/Button";
import "./FinalResultCard.css";

export type FinalResultTone = "winner" | "top" | "survived" | "rekt" | "dnf" | "average";

export interface FinalResultCardProps {
  archetypeId: ArchetypeId;
  archetypeName: string;
  mood?: ArchetypeMood;
  title: ReactNode;
  score: ReactNode;
  rank?: ReactNode;
  tone?: FinalResultTone;
  stats?: Array<{ label: ReactNode; value: ReactNode }>;
  badges?: ReactNode[];
  onShare?: () => void;
  onContinue?: () => void;
}

export function FinalResultCard({
  archetypeId,
  archetypeName,
  mood = "neutral",
  title,
  score,
  rank,
  tone = "average",
  stats = [],
  badges = [],
  onShare,
  onContinue,
}: FinalResultCardProps) {
  return (
    <article className={`final-result-card final-result-card--${tone}`}>
      <div className="final-result-card__hero">
        <img src={archetypeAssets[archetypeId].cutout[mood]} alt="" />
      </div>
      <div className="final-result-card__content">
        <header>
          <h2>{title}</h2>
          <div className="final-result-card__archetype">{archetypeName}</div>
        </header>
        <div className="final-result-card__score text-number">{score}</div>
        {rank && <div className="final-result-card__rank">{rank}</div>}
        {badges.length > 0 && (
          <div className="final-result-card__badges">
            {badges.map((badge, index) => (
              <Badge key={index} tone="rare">
                {badge}
              </Badge>
            ))}
          </div>
        )}
        {stats.length > 0 && (
          <dl className="final-result-card__stats">
            {stats.map((stat, index) => (
              <div key={index}>
                <dt>{stat.label}</dt>
                <dd className="text-number">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="final-result-card__actions">
          {onShare && (
            <Button variant="secondary" onClick={onShare}>
              Поделиться
            </Button>
          )}
          {onContinue && (
            <Button variant="primary" onClick={onContinue}>
              Играть еще раз
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
