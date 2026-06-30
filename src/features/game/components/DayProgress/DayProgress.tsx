import "./DayProgress.css";

export interface DayProgressProps {
  totalDays: number;
  currentDay: number;
  completedDays?: number[];
}

export function DayProgress({ totalDays, currentDay, completedDays = [] }: DayProgressProps) {
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);

  return (
    <ol className="game-day-progress" aria-label="Прогресс дней">
      {days.map((day) => {
        const completed = completedDays.includes(day);
        const active = day === currentDay;
        return (
          <li
            className={[
              "game-day-progress__day",
              active && "game-day-progress__day--active",
              completed && "game-day-progress__day--completed",
            ]
              .filter(Boolean)
              .join(" ")}
            key={day}
          >
            <span className="text-number">
              {completed ? (
                <svg className="game-day-progress__check" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M13.5 4.5L6.7 11.3L3 7.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : (
                day
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
