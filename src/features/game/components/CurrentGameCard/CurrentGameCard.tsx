import { archetypeAssets, type ArchetypeId } from "../../../../shared/assets/archetypeAssets";
import { Button } from "../../../../shared/ui/Button/Button";
import { Card } from "../../../../shared/ui/Card/Card";
import { StatBar, type StatTone } from "../../../../shared/ui/StatBar/StatBar";
import "./CurrentGameCard.css";

export interface CurrentGameStat {
  label: string;
  value: number;
  tone: StatTone;
}

export interface CurrentGameCardProps {
  roomName: string;
  dayLabel: string;
  nextEvent: string;
  archetypeId: ArchetypeId;
  stats: CurrentGameStat[];
  onContinue?: () => void;
}

export function CurrentGameCard({ roomName, dayLabel, nextEvent, archetypeId, stats, onContinue }: CurrentGameCardProps) {
  return (
    <Card className="current-game-card" variant="elevated">
      <div className="current-game-card__top">
        <img src={archetypeAssets[archetypeId].avatar.sm} alt="" />
        <div>
          <div className="current-game-card__eyebrow">Текущая игра</div>
          <h2>{roomName}</h2>
          <p>{dayLabel}</p>
        </div>
      </div>
      <div className="current-game-card__event text-number">{nextEvent}</div>
      <div className="current-game-card__stats">
        {stats.map((stat) => (
          <StatBar key={stat.label} label={stat.label} max={100} tone={stat.tone} value={stat.value} />
        ))}
      </div>
      <Button fullWidth onClick={onContinue}>
        Продолжить игру
      </Button>
    </Card>
  );
}
