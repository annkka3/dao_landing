import type { ScoreBonusDTO } from "../../../../api/types";
import "./BonusList.css";

export interface BonusListProps {
  title: string;
  bonuses?: ScoreBonusDTO[] | null;
  emptyText?: string;
}

function formatPoints(points: number): string {
  if (points > 0) return `+${points}`;
  if (points < 0) return `${points}`;
  return "0";
}

/** Renders the scoring v2-light bonus breakdown (slug/title/points/reason
 * from the API, never hardcoded) used on DayRecapPage and FinalResultPage. */
export function BonusList({ title, bonuses, emptyText }: BonusListProps) {
  const items = bonuses ?? [];

  if (items.length === 0) {
    if (!emptyText) return null;
    return (
      <div className="game-bonus-list">
        <span className="game-bonus-list__title">{title}</span>
        <p className="game-bonus-list__empty">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="game-bonus-list">
      <span className="game-bonus-list__title">{title}</span>
      <div className="game-bonus-list__items">
        {items.map((bonus, index) => (
          <div className="game-bonus-list__item" key={`${bonus.slug}-${index}`}>
            <div className="game-bonus-list__item-head">
              <span className="game-bonus-list__points">{formatPoints(bonus.points)}</span>
              <span className="game-bonus-list__item-title">{bonus.title}</span>
            </div>
            {bonus.reason && <p className="game-bonus-list__reason">{bonus.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
