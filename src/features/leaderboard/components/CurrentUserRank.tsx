import { LeaderboardRow, type LeaderboardRowProps } from "./LeaderboardRow";
import "./Leaderboard.css";

export function CurrentUserRank(props: LeaderboardRowProps) {
  return (
    <div className="current-user-rank">
      <LeaderboardRow {...props} currentUser />
    </div>
  );
}
