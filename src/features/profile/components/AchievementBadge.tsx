import "./Profile.css";

export interface AchievementBadgeProps {
  label: string;
  icon: string;
  unlocked?: boolean;
}

export function AchievementBadge({ label, icon, unlocked = true }: AchievementBadgeProps) {
  return (
    <span className={unlocked ? "achievement-badge" : "achievement-badge achievement-badge--locked"}>
      <img src={icon} alt="" />
      <span>{label}</span>
    </span>
  );
}
