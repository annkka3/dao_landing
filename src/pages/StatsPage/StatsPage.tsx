import { useQuery } from "@tanstack/react-query";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getGameState } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import type { StatsDTO } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./StatsPage.css";

interface StatPresentation {
  key: keyof StatsDTO;
  label: string;
  desc: string;
  color: string;
  iconBg: string;
  Icon: (p: { size?: number; color?: string }) => JSX.Element;
}

const STAT_PRESENTATION: StatPresentation[] = [
  { key: "bankroll",    label: "БАНКРОЛЛ",    desc: "Управление ресурсами",            color: "#22c55e", iconBg: "rgba(34,197,94,0.22)",  Icon: BankrollIcon },
  { key: "reputation",  label: "РЕПУТАЦИЯ",   desc: "Влияние и доверие",               color: "#3882f6", iconBg: "rgba(56,130,246,0.22)", Icon: ReputationIcon },
  { key: "alpha",       label: "АЛЬФА",        desc: "Информационное преимущество",    color: "#ffd23f", iconBg: "rgba(255,210,63,0.22)", Icon: AlphaIcon },
  { key: "stress",      label: "СТРЕСС",       desc: "Эмоциональное давление",         color: "#ef4444", iconBg: "rgba(239,68,68,0.22)",  Icon: StressIcon },
  { key: "fomo",        label: "FOMO",         desc: "Страх упустить выгоду",          color: "#f97316", iconBg: "rgba(249,115,22,0.22)", Icon: FomoIcon },
  { key: "discipline",  label: "ДИСЦИПЛИНА",  desc: "Самоконтроль и стратегия",       color: "#a855f7", iconBg: "rgba(168,85,247,0.22)", Icon: DisciplineIcon },
  { key: "degen_index", label: "DEGEN INDEX",  desc: "Хаос и непредсказуемость",       color: "#ff2ed6", iconBg: "rgba(255,46,214,0.22)", Icon: DegenIcon },
];

export interface StatsPageProps {
  onBack?: () => void;
}

export function StatsPage({ onBack }: StatsPageProps) {
  const { data, isLoading, isError, error } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError || !data || data.state !== "active" || !data.participant || !data.room || !data.current_day) {
    return (
      <ErrorState
        title={isError ? undefined : "Нет активной игры"}
        message={isError ? friendlyErrorMessage(error) : "Сейчас нет активной игры."}
        action={onBack && <button type="button" onClick={onBack}>Назад</button>}
      />
    );
  }

  const { room, participant, current_day: currentDay } = data;

  return (
    <main className="st">

      {/* ── Header ── */}
      <header className="st__header">
        <div className="st__header-row">
          <BrandHeader />
          <button className="st__header-btn" type="button" aria-label="Назад" onClick={onBack}>
            <ArrowLeftIcon size={20} />
          </button>
        </div>
      </header>

      <div className="st__frame">

        {/* ── Game context bar ── */}
        <div className="st__info-bar">
          <div className="st__info-col">
            <span className="st__info-label">КОМНАТА</span>
            <span className="st__info-value">{room.title}</span>
          </div>
          <div className="st__info-divider" />
          <div className="st__info-col">
            <span className="st__info-label">ДЕНЬ</span>
            <span className="st__info-value">{currentDay.day_number} / {room.season_length_days}</span>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="st__title-block">
          <div className="st__title-row">
            <div className="st__title-line" />
            <h1 className="st__page-title">STATS</h1>
            <div className="st__title-line" />
          </div>
          <p className="st__page-sub">— ПОКАЗАТЕЛИ —</p>
          <p className="st__page-desc">Отслеживай свои показатели и влияй на результат.</p>
        </div>

        {/* ── Stat rows ── */}
        <div className="st__stats-list">
          {STAT_PRESENTATION.map((stat) => {
            const value = participant.stats[stat.key];
            return (
              <div key={stat.key} className="st__stat-card">
                <div className="st__stat-top">
                  <div className="st__stat-hex" style={{ background: stat.iconBg }}>
                    <stat.Icon size={22} color={stat.color} />
                  </div>
                  <div className="st__stat-name-col">
                    <span className="st__stat-name" style={{ color: stat.color }}>{stat.label}</span>
                    <span className="st__stat-desc">{stat.desc}</span>
                  </div>
                  <div className="st__stat-value-col">
                    <span className="st__stat-value" style={{ color: stat.color }}>{value}</span>
                  </div>
                </div>
                <div className="st__stat-bar-section">
                  <span className="st__stat-range-label">0</span>
                  <div className="st__stat-bar-track">
                    <div
                      className="st__stat-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: stat.color }}
                    />
                  </div>
                  <span className="st__stat-range-label st__stat-range-label--right">100</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}

/* ── Icons ── */

function ArrowLeftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlphaIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20l4-8 4 4 4-10 4 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5" r="2" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function BankrollIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.7" />
      <path d="M3 20v-1a6 6 0 0 1 12 0v1" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 10a3 3 0 1 0 0-6M21 20v-1a6 6 0 0 0-4-5.66" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ReputationIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function StressIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.7" />
      <path d="M12 4v2M12 18v2M4 12H2M22 12h-2" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function FomoIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2c0 0-7 5-7 12a7 7 0 0 0 14 0c0-4-3-7-3-7s0 3-2 4c0-3-2-9-2-9z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function DisciplineIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DegenIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
