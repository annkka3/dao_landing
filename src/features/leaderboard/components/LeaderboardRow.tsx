import type { CSSProperties, ReactNode } from "react";
import { archetypeAssets, type ArchetypeId } from "../../../shared/assets/archetypeAssets";
import "./Leaderboard.css";

export interface LeaderboardRowProps {
  rank: number | string;
  playerName: ReactNode;
  archetypeId: ArchetypeId;
  archetypeName?: ReactNode;
  score: ReactNode;
  delta?: ReactNode;
  currentUser?: boolean;
  rekt?: boolean;
  loading?: boolean;
  accent?: string;
}

export function LeaderboardRow({
  rank,
  playerName,
  archetypeId,
  archetypeName,
  score,
  delta,
  currentUser = false,
  rekt = false,
  loading = false,
  accent = "var(--color-game-bonus)",
}: LeaderboardRowProps) {
  if (loading) {
    return <div className="leaderboard-row leaderboard-row--loading" />;
  }

  return (
    <div
      className={[
        "leaderboard-row",
        currentUser && "leaderboard-row--current",
        rekt && "leaderboard-row--rekt",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--leaderboard-accent": accent } as CSSProperties}
    >
      <div className="leaderboard-row__rank text-number">{rank}</div>
      <img className="leaderboard-row__avatar" src={archetypeAssets[archetypeId].avatar.sm} alt="" />
      <div className="leaderboard-row__identity">
        <div className="leaderboard-row__name">{playerName}</div>
        {archetypeName && <div className="leaderboard-row__archetype">{archetypeName}</div>}
      </div>
      <div className="leaderboard-row__score text-number">{score}</div>
      {delta && <div className="leaderboard-row__delta text-number">{delta}</div>}
    </div>
  );
}
