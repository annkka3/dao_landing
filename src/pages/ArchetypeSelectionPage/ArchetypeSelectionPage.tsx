import { useState, type CSSProperties } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { archetypeAccentFor } from "../../shared/assets/archetypePresentation";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { useAppContext } from "../../store/AppContext";
import { QK } from "../../store/queryClient";
import { getArchetypes, selectArchetype } from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import { friendlyErrorMessage } from "../../api/errorMessages";
import type { ParticipantDTO, RoomDTO } from "../../api/types";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./ArchetypeSelectionPage.css";

const ARCHETYPE_PRESENTATION: Record<string, { Icon: React.FC<{ size?: number }> }> = {
  risk_manager:        { Icon: ShieldIcon },
  meme_degen:          { Icon: SmileyIcon },
  onchain_detective:   { Icon: SearchIcon },
  leverage_cowboy:     { Icon: CrownIcon },
  hodl_monk:           { Icon: LotusIcon },
  airdrop_farmer:      { Icon: ParachuteIcon },
  moon_prophet:        { Icon: MoonIcon },
  capitulation_doomer: { Icon: CloudRainIcon },
};

const ARCHETYPE_ENGLISH_NAMES: Record<string, string> = {
  risk_manager: "Risk Manager",
  meme_degen: "Meme Degen",
  onchain_detective: "On-chain Detective",
  leverage_cowboy: "Leverage Cowboy",
  hodl_monk: "HODL Monk",
  airdrop_farmer: "Airdrop Farmer",
  moon_prophet: "Moon Prophet",
  capitulation_doomer: "Capitulation Doomer",
};

const STARTING_STAT_LABELS = {
  bankroll: "Банкролл",
  discipline: "Дисциплина",
  fomo: "FOMO",
  reputation: "Репутация",
  alpha: "Альфа",
  stress: "Стресс",
  degen_index: "Degen",
} as const;

// Scattered twinkle positions over the chooser backdrop — same approximate
// technique already used on Room/Profile, generic across all archetype bgs.
const ARCH_PARTICLES: Array<{ left: number; top: number; duration: number; delay: number; tone: "ua" | "gold" }> = [
  { left: 8, top: 10, duration: 2.4, delay: 0, tone: "gold" },
  { left: 90, top: 8, duration: 2.9, delay: 0.5, tone: "ua" },
  { left: 5, top: 28, duration: 3.2, delay: 1.1, tone: "ua" },
  { left: 93, top: 24, duration: 2.1, delay: 0.2, tone: "gold" },
  { left: 10, top: 46, duration: 2.7, delay: 1.6, tone: "gold" },
  { left: 88, top: 42, duration: 3.0, delay: 0.8, tone: "ua" },
  { left: 6, top: 64, duration: 2.3, delay: 2.0, tone: "ua" },
  { left: 92, top: 60, duration: 2.6, delay: 0.4, tone: "gold" },
  { left: 14, top: 18, duration: 3.1, delay: 1.4, tone: "ua" },
  { left: 84, top: 14, duration: 2.5, delay: 1.9, tone: "gold" },
  { left: 4, top: 80, duration: 2.8, delay: 0.7, tone: "gold" },
  { left: 95, top: 76, duration: 2.2, delay: 1.2, tone: "ua" },
];

function presentationFor(slug: string) {
  return {
    accent: archetypeAccentFor(slug),
    Icon: ARCHETYPE_PRESENTATION[slug]?.Icon ?? ARCHETYPE_PRESENTATION.risk_manager.Icon,
  };
}

function topStartingStats(stats: Record<keyof typeof STARTING_STAT_LABELS, number>) {
  return Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([key]) => STARTING_STAT_LABELS[key as keyof typeof STARTING_STAT_LABELS]);
}

export interface ArchetypeSelectionPageProps {
  onConfirm?: (room: RoomDTO, participant: ParticipantDTO) => void;
  onBack?: () => void;
}

export function ArchetypeSelectionPage({ onConfirm, onBack }: ArchetypeSelectionPageProps) {
  const { state } = useAppContext();
  const room = state.currentRoom;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    state.currentParticipant?.archetype_slug ?? null
  );

  const { data, isLoading } = useQuery({
    queryKey: QK.archetypes,
    queryFn: () => getArchetypes("ru"),
  });
  const items = data?.items ?? [];
  const selected = items.find((a) => a.slug === selectedSlug) ?? items[0];
  const selectedIndex = Math.max(0, items.findIndex((a) => a.slug === selected.slug));

  const confirmMutation = useMutation({
    mutationFn: () => {
      if (!room || !selected) throw new Error("Room or archetype missing");
      return selectArchetype(
        room.public_id,
        { archetype_slug: selected.slug },
        createIdempotencyKey("select-archetype")
      );
    },
    onSuccess: ({ room: updatedRoom, participant }) => onConfirm?.(updatedRoom, participant),
  });

  // A participant who already has an archetype can't reopen this screen once
  // the room is active (the "change archetype" case — still correctly blocked
  // server-side too). A late-joiner with no archetype yet gets a free pass
  // through here regardless of room status — see `select_archetype`'s
  // late-joiner branch on the backend.
  const alreadyHasArchetype = Boolean(state.currentParticipant?.archetype_slug);
  if (room && room.status !== "lobby" && alreadyHasArchetype) {
    return (
      <ErrorState
        title="Архетип уже не изменить"
        message="Игра уже началась — архетип менять нельзя."
        action={onBack && <button type="button" onClick={onBack}>Назад в лобби</button>}
      />
    );
  }

  if (isLoading || !selected) {
    return (
      <main className="arch">
        <div className="arch__frame">
          <p className="arch__disclaimer">Загрузка архетипов…</p>
        </div>
      </main>
    );
  }

  const selectedPresentation = presentationFor(selected.slug);
  const selectedAssets = archetypeAssets[selected.slug as ArchetypeId];
  const SelectedIcon = selectedPresentation.Icon;
  const selectedName = ARCHETYPE_ENGLISH_NAMES[selected.slug] ?? selected.name;
  const selectedSkills = topStartingStats(selected.starting_stats);
  const selectPrevious = () => {
    if (items.length === 0) return;
    setSelectedSlug(items[(selectedIndex - 1 + items.length) % items.length].slug);
  };
  const selectNext = () => {
    if (items.length === 0) return;
    setSelectedSlug(items[(selectedIndex + 1) % items.length].slug);
  };

  return (
    <main className="arch">

      {/* ── Header ── */}
      <header className="arch__header">
        <BrandHeader />
      </header>

      <div className="arch__frame">

        {/* ── Title ── */}
        <div className="arch__title-block">
          <div className="arch__title-row">
            <div className="arch__title-line" />
            <h1 className="arch__page-title">CHOOSE ARCHETYPE</h1>
            <div className="arch__title-line" />
          </div>
          <p className="arch__page-sub">— ВЫБОР АРХЕТИПА —</p>
          <p className="arch__subtitle">
            Каждый архетип — свой стиль игры.{" "}
            Выбери, кем пережить <span className="arch__subtitle-accent" style={{ whiteSpace: "nowrap" }}>7 дней</span> крипто-хаоса.
          </p>
        </div>

        {/* ── Archetype chooser ── */}
        <section
          className="arch__chooser"
          style={{ "--arch-accent": selectedPresentation.accent } as CSSProperties}
        >
          <div className="arch__chooser-bg" aria-hidden="true" />
          <div className="arch__chooser-scan" aria-hidden="true" />
          <div className="arch__chooser-glow" aria-hidden="true" />
          {ARCH_PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`arch__particle arch__particle--${p.tone}`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
              aria-hidden="true"
            />
          ))}

          <button
            className="arch__nav-btn arch__nav-btn--prev"
            type="button"
            onClick={selectPrevious}
            aria-label="Предыдущий архетип"
          >
            <ChevronLeftIcon size={34} />
          </button>
          <button
            className="arch__nav-btn arch__nav-btn--next"
            type="button"
            onClick={selectNext}
            aria-label="Следующий архетип"
          >
            <ChevronRightIcon size={34} />
          </button>

          <div className="arch__hero">
            <img
              key={selected.slug}
              className="arch__hero-character"
              src={selectedAssets.cutout.fullNeutral}
              alt=""
            />
          </div>

          <div className="arch__info-panel">
            <h2 className="arch__hero-title">{selectedName}</h2>
            <div className="arch__hero-role">
              <SelectedIcon size={16} />
              <span>{selected.name}</span>
            </div>
            <p className="arch__hero-desc">{selected.description}</p>
            <div className="arch__skills-title">КЛЮЧЕВЫЕ СКИЛЛЫ</div>
            <div className="arch__skills">
              {selectedSkills.map((skill) => (
                <div className="arch__skill" key={skill}>
                  <span className="arch__skill-icon">
                    <HexCheckIcon size={18} />
                  </span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Confirm button ── */}
        {confirmMutation.isError && (
          <p className="arch__disclaimer">{friendlyErrorMessage(confirmMutation.error)}</p>
        )}
        <button
          type="button"
          className="arch__confirm-btn"
          style={{ "--arch-accent": selectedPresentation.accent } as CSSProperties}
          disabled={confirmMutation.isPending}
          onClick={() => confirmMutation.mutate()}
        >
          {confirmMutation.isPending ? "ВЫБИРАЕМ..." : "ВЫБРАТЬ АРХЕТИП"}
          <ChevronRightIcon size={22} />
        </button>

        {/* ── Disclaimer ── */}
        <p className="arch__disclaimer">
          <InfoCircleIcon size={13} />
          {room && room.status !== "lobby"
            ? "Игра уже идёт — выбор архетипа окончательный"
            : "Вы сможете изменить архетип до начала игры"}
        </p>

      </div>
    </main>
  );
}

/* ── Icons ── */

function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HexCheckIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoCircleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8h.01M12 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmileyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 14.5s1 2 3.5 2 3.5-2 3.5-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CrownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 18h18M5 18L3 8l5 4 4-7 4 7 5-4-2 10H5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function LotusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4c0 0-6 3-6 9 0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7 0-6-6-9-6-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 13c-2-1-4 1-4 4 2.5 1.5 6 0 7-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 13c2-1 4 1 4 4-2.5 1.5-6 0-7-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ParachuteIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 10a9 9 0 0 1 18 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 10L12 17l4.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CloudRainIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 19v2M12 18v2M16 19v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
