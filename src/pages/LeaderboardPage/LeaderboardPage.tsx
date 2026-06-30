import { useQuery } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getDailyResults, getGameState, getLeaderboard } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { EquippedProfileFrame } from "../../features/market/components/EquippedProfileFrame";
import { getEquippedProfileFrame } from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import type { DailyResultDTO, LeaderboardEntryDTO } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./LeaderboardPage.css";

const ARCH_INFO: Record<ArchetypeId, { name: string; accent: string }> = {
  risk_manager:        { name: "Risk Manager",        accent: "#3a8cff" },
  meme_degen:          { name: "Meme Degen",           accent: "#b84dff" },
  onchain_detective:   { name: "On-chain Detective",   accent: "#00d4ff" },
  leverage_cowboy:     { name: "Leverage Cowboy",      accent: "#ffba00" },
  hodl_monk:           { name: "HODL Monk",            accent: "#ffd23f" },
  airdrop_farmer:      { name: "Airdrop Farmer",       accent: "#22e6b3" },
  moon_prophet:        { name: "Moon Prophet",         accent: "#39ff14" },
  capitulation_doomer: { name: "Capitulation Doomer",  accent: "#ff3b30" },
};
const DEFAULT_ARCH = { name: "—", accent: "var(--color-text-muted)" };

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 1 });
}

export interface LeaderboardPageProps {
  onBack?: () => void;
  onFinal?: () => void;
  onOpenDayResult?: (dayNumber: number) => void;
}

export function LeaderboardPage({ onBack, onFinal, onOpenDayResult }: LeaderboardPageProps) {
  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const publicId = gameState?.room?.public_id;

  const { data: leaderboardData, isLoading, isError, error } = useQuery({
    queryKey: publicId ? QK.leaderboard(publicId) : ["leaderboard", "pending"],
    queryFn: () => getLeaderboard(publicId as string),
    enabled: publicId != null,
  });

  const { data: dailyResultsData } = useQuery({
    queryKey: QK.dailyResults,
    queryFn: getDailyResults,
    enabled: publicId != null,
  });
  const { data: equippedItemsData } = useEquippedItems(publicId != null);

  if (!publicId) {
    return (
      <ErrorState
        title="Таблица лидеров недоступна"
        message="Сейчас нет активной комнаты для таблицы лидеров."
        action={onBack && <button type="button" onClick={onBack}>Назад</button>}
      />
    );
  }

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError || !leaderboardData) {
    return (
      <ErrorState
        message={friendlyErrorMessage(error, "Не удалось загрузить лидерборд.")}
        action={onBack && <button type="button" onClick={onBack}>Назад</button>}
      />
    );
  }

  const showFinalCta = onFinal && gameState?.state === "finished";
  const myEntryHidden =
    leaderboardData.current_user_entry &&
    !leaderboardData.entries.some((e) => e.participant_id === leaderboardData.current_user_entry!.participant_id);
  const totalDays = gameState?.room?.season_length_days ?? 7;
  const dayResultRows = buildDayResultRows(dailyResultsData?.items ?? [], totalDays);
  const topThree = leaderboardData.entries.slice(0, 3);
  const seasonStatusLabel = gameState?.state === "finished" ? "СЕЗОН ЗАВЕРШЁН" : "СЕЗОН ИДЁТ";
  const currentUserFrame = getEquippedProfileFrame(equippedItemsData?.items ?? []);

  return (
    <main className="lb">

      {/* ── Header ── */}
      <header className="lb__header">
        <BrandHeader />
      </header>

      <div className="lb__frame">

        {/* ── Title ── */}
        <div className="lb__title-row">
          <div className="lb__title-line" />
          <h1 className="lb__page-title">LEADERBOARD</h1>
          <div className="lb__title-line" />
        </div>
        <p className="lb__page-sub">— ТАБЛИЦА ЛИДЕРОВ —</p>
        <div className="lb__season-status">
          <span>✓</span>
          <span>{seasonStatusLabel}</span>
          <span>✓</span>
        </div>

        {/* ── Podium ── */}
        <section className="lb__podium" aria-label="Топ 3 игроков">
          {leaderboardData.entries.length === 0 ? (
            <p className="lb__notice">Пока нет результатов.</p>
          ) : (
            [topThree[1], topThree[0], topThree[2]].map((entry, index) => (
              <PodiumCard
                key={entry?.participant_id ?? `empty-podium-${index}`}
                entry={entry}
                slot={index === 0 ? "second" : index === 1 ? "first" : "third"}
              />
            ))
          )}
        </section>

        {/* ── Rows ── */}
        {leaderboardData.entries.length > 0 && (
          <section className="lb__top-card" aria-label="Топ игроков комнаты">
            <div className="lb__top-title-row">
              <div className="lb__title-line" />
              <h2 className="lb__top-title">ТОП ИГРОКОВ КОМНАТЫ</h2>
              <div className="lb__title-line" />
            </div>
            <div className="lb__top-list">
              {leaderboardData.entries.map((entry) => (
                <LeaderListRow
                  key={entry.participant_id}
                  entry={entry}
                  currentUserFrame={currentUserFrame}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Current user, if outside the visible list ── */}
        {myEntryHidden && leaderboardData.current_user_entry && (
          <>
            <div className="lb__separator">
              <div className="lb__sep-line" />
              <span className="lb__sep-text">ТВОЯ ПОЗИЦИЯ</span>
              <div className="lb__sep-line" />
            </div>
            <LeaderListRow entry={leaderboardData.current_user_entry} currentUserFrame={currentUserFrame} />
          </>
        )}

        {/* ── Day results ── */}
        <section className="lb__day-results-section" aria-label="Результаты по дням">
          <div className="lb__title-row lb__day-results-title-row">
            <div className="lb__title-line" />
            <h2 className="lb__page-title lb__day-results-title">DAY RESULTS</h2>
            <div className="lb__title-line" />
          </div>
          <p className="lb__page-sub lb__day-results-sub">— РЕЗУЛЬТАТЫ ПО ДНЯМ —</p>

          <div className="lb__daily-results-card">
            <div className="lb__daily-results-list">
              {dayResultRows.map((row) => (
                <DayResultRow
                  key={row.dayNumber}
                  row={row}
                  onOpen={onOpenDayResult}
                />
              ))}
            </div>
          </div>
        </section>

        {showFinalCta && (
          <button type="button" className="lb__rewards-btn" onClick={onFinal}>
            К финальным результатам
          </button>
        )}

      </div>
    </main>
  );
}

type DayResultRowView = {
  dayNumber: number;
  result: DailyResultDTO | null;
};

function buildDayResultRows(results: DailyResultDTO[], totalDays: number): DayResultRowView[] {
  const byDay = new Map(results.map((item) => [item.day_number, item]));
  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    return {
      dayNumber,
      result: byDay.get(dayNumber) ?? null,
    };
  });
}

function DayResultRow({
  row,
  onOpen,
}: {
  row: DayResultRowView;
  onOpen?: (dayNumber: number) => void;
}) {
  const { dayNumber, result } = row;
  const isLocked = result == null;
  const tone = result ? dailyDeltaTone(result.score_delta) : "locked";
  const color = dailyDeltaColor(tone);
  const summary = result ? dailyDeltaSummary(result.score_delta) : "День ещё не завершён";
  const Icon = isLocked ? LockIcon : tone === "pos" ? TrendUpIcon : tone === "neg" ? TrendDownIcon : TrendFlatIcon;

  return (
    <button
      type="button"
      className={`lb__daily-row lb__daily-row--${tone}`}
      style={{ "--day-tone": color } as CSSProperties}
      disabled={isLocked}
      onClick={() => {
        if (!isLocked) onOpen?.(dayNumber);
      }}
    >
      <span className="lb__daily-trend">
        <Icon size={18} />
      </span>
      <span className="lb__daily-day">День {dayNumber}</span>
      <span className="lb__daily-summary">{summary}</span>
      <span className="lb__daily-score">
        {result ? formatSignedScore(result.score_delta) : "—"}
      </span>
    </button>
  );
}

function PodiumCard({
  entry,
  slot,
}: {
  entry: LeaderboardEntryDTO | undefined;
  slot: "first" | "second" | "third";
}) {
  if (!entry) {
    return <div className={`lb__podium-card lb__podium-card--${slot} lb__podium-card--empty`} />;
  }

  const { rank, display_name, archetype_slug, score } = entry;
  const arch = archetypeInfo(archetype_slug);
  const assets = archetypeAssetsFor(archetype_slug);
  const podiumHeroSrc = entry.character_skin?.cutouts.neutral ?? assets?.cutout.neutral;

  return (
    <div className={`lb__podium-card lb__podium-card--${slot}`} style={{ "--arch-accent": arch.accent } as CSSProperties}>
      <span className={`lb__podium-rank lb__podium-rank--${rank}`}>{rank}</span>
      {podiumHeroSrc ? (
        <img className="lb__podium-hero" src={podiumHeroSrc} alt="" />
      ) : (
        <span className="lb__podium-hero lb__podium-hero--empty" />
      )}
      <div className="lb__podium-info">
        <span className="lb__podium-name">{display_name}</span>
        <span className="lb__podium-arch">{arch.name}</span>
        <span className="lb__podium-score">{fmt(score)}</span>
      </div>
    </div>
  );
}

function LeaderListRow({
  entry,
  currentUserFrame,
}: {
  entry: LeaderboardEntryDTO;
  currentUserFrame?: ReturnType<typeof getEquippedProfileFrame>;
}) {
  const { rank, display_name, archetype_slug, score, is_current_user } = entry;
  const arch = archetypeInfo(archetype_slug);
  const assets = archetypeAssetsFor(archetype_slug);

  return (
    <div className={`lb__top-row${is_current_user ? " lb__top-row--me" : ""}`}>
      <span className={`lb__top-rank lb__top-rank--${rank <= 3 ? rank : "default"}`}>{rank}</span>

      <EquippedProfileFrame
        frame={is_current_user ? currentUserFrame ?? null : null}
        size="sm"
        className="lb__equipped-avatar-frame"
      >
        <div className="lb__top-avatar-wrap" style={{ "--arch-accent": arch.accent } as CSSProperties}>
          {assets ? (
            <img className="lb__top-avatar" src={assets.avatar.sm} alt="" />
          ) : (
            <span className="lb__top-avatar lb__top-avatar--empty" />
          )}
        </div>
      </EquippedProfileFrame>

      <div className="lb__top-info">
        <span className="lb__top-name">{display_name}</span>
        <span className="lb__top-arch" style={{ color: arch.accent }}>{arch.name}</span>
      </div>

      <div className="lb__top-score-wrap">
        <span className="lb__top-score">{fmt(score)}</span>
        {rank === 1 ? (
          <span className="lb__top-leader">ЛИДЕР<br />СЕЗОНА</span>
        ) : null}
      </div>
    </div>
  );
}

function archetypeInfo(slug: string | null) {
  return slug ? (ARCH_INFO[slug as ArchetypeId] ?? DEFAULT_ARCH) : DEFAULT_ARCH;
}

function archetypeAssetsFor(slug: string | null) {
  if (!slug || !(slug in archetypeAssets)) return null;
  return archetypeAssets[slug as ArchetypeId];
}

type DailyDeltaTone = "pos" | "neg" | "flat" | "locked";

function dailyDeltaTone(delta: number): DailyDeltaTone {
  if (delta > 0) return "pos";
  if (delta < 0) return "neg";
  return "flat";
}

function dailyDeltaColor(tone: DailyDeltaTone): string {
  if (tone === "pos") return "#7cff2e";
  if (tone === "neg") return "#ff3b30";
  return "#9ba5b7";
}

function dailyDeltaSummary(delta: number): string {
  if (delta >= 70) return "Мощное завершение";
  if (delta >= 40) return "Удачная серия решений";
  if (delta >= 20) return "Хороший разгон";
  if (delta >= 1) return "Осторожный старт";
  if (delta === 0) return "День без движения";
  if (delta >= -19) return "Неправильный вход";
  if (delta >= -39) return "Ошибки в рынке";
  if (delta >= -59) return "Жёсткая просадка";
  return "Критический провал";
}

function formatSignedScore(value: number): string {
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value > 0 ? `+${formatted}` : formatted;
}

function TrendUpIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l5-5 4 4 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendDownIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8l5 5 4-4 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 16h5v-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendFlatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15 8l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}
