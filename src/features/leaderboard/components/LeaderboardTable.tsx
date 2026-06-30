import { LeaderboardRow, type LeaderboardRowProps } from "./LeaderboardRow";
import "./Leaderboard.css";

export interface LeaderboardTableProps {
  rows: Array<LeaderboardRowProps & { id: string }>;
}

export function LeaderboardTable({ rows }: LeaderboardTableProps) {
  return (
    <div className="leaderboard-table">
      {rows.map((row) => (
        <LeaderboardRow key={row.id} {...row} />
      ))}
    </div>
  );
}
