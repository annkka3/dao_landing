import { useQuery } from "@tanstack/react-query";
import { getGameState, getRoomParticipants } from "../../../api/endpoints";
import { EquippedProfileFrame } from "../../../features/market/components/EquippedProfileFrame";
import { getEquippedProfileFrame } from "../../../features/market/equipped";
import { useEquippedItems } from "../../../features/market/hooks";
import { archetypeAssets, type ArchetypeId } from "../../assets/archetypeAssets";
import { QK } from "../../../store/queryClient";
import { useAppContext } from "../../../store/AppContext";
import "./BrandHeader.css";

/**
 * Hand-authored cube glyph — intentionally simple (no blur/filter/foreignObject
 * primitives) so it renders identically across browsers and Telegram's WebView,
 * unlike the original Figma-exported logo-icon.svg asset it replaces.
 */
function CubeGlyph() {
  return (
    <svg viewBox="0 0 36 36" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M18 4L30.5 11V25L18 32L5.5 25V11L18 4Z"
        stroke="#66F7FF"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(0, 229, 255, 0.08)"
      />
      <path
        d="M18 4V18M18 18L30.5 11M18 18L5.5 11M18 18V32"
        stroke="#66F7FF"
        strokeWidth="1.1"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="1.6" fill="#9FF9FF" />
    </svg>
  );
}

/** Wireframe sphere glyph — pairs with the new Room screen's orbital/atom motif. */
function SphereGlyph() {
  return (
    <svg viewBox="0 0 36 36" width="22" height="22" fill="none" aria-hidden="true">
      <circle cx="18" cy="18" r="13" stroke="#66F7FF" strokeWidth="1.4" />
      <ellipse cx="18" cy="18" rx="13" ry="5" stroke="#66F7FF" strokeWidth="1" strokeOpacity="0.6" />
      <ellipse cx="18" cy="18" rx="5" ry="13" stroke="#F5C875" strokeWidth="1" strokeOpacity="0.7" />
      <circle cx="18" cy="18" r="2" fill="#FFE7B0" />
    </svg>
  );
}

export interface BrandHeaderProps {
  iconVariant?: "cube" | "sphere";
  wordmarkVariant?: "split" | "gradient" | "neon";
  align?: "left" | "right";
  showIcon?: boolean;
  showPlayerChip?: boolean;
}

export function BrandHeader({
  iconVariant = "cube",
  wordmarkVariant = "split",
  align = "left",
  showIcon = true,
  showPlayerChip = true,
}: BrandHeaderProps) {
  const { state } = useAppContext();
  const room = state.currentRoom;
  const participant = state.currentParticipant;
  const shouldShowPlayerChip = Boolean(showPlayerChip && participant);
  const { data: participantsData } = useQuery({
    queryKey: room ? QK.roomParticipants(room.public_id) : ["roomParticipants", "brand", "pending"],
    queryFn: () => getRoomParticipants(room!.public_id),
    enabled: shouldShowPlayerChip && room != null,
    staleTime: 20_000,
  });
  const { data: gameStateData } = useQuery({
    queryKey: QK.gameState,
    queryFn: getGameState,
    enabled: shouldShowPlayerChip && room != null,
    staleTime: 10_000,
  });
  const { data: equippedItemsData } = useEquippedItems(shouldShowPlayerChip);
  const participantSummary = participantsData?.participants.find((p) => p.participant_id === participant?.id);
  const archetypeId = (
    gameStateData?.participant?.archetype_slug ??
    participant?.archetype_slug ??
    undefined
  ) as ArchetypeId | undefined;
  const displayName = participantSummary?.display_name ?? state.user?.first_name ?? state.user?.username ?? "Ты";
  const score = gameStateData?.participant?.score;
  const profileFrame = getEquippedProfileFrame(equippedItemsData?.items ?? []);
  const effectiveShowIcon = shouldShowPlayerChip ? false : showIcon;
  const effectiveWordmarkVariant =
    shouldShowPlayerChip && wordmarkVariant === "split" ? "gradient" : wordmarkVariant;

  return (
    <div
      className={[
        "brand-header",
        align === "right" && "brand-header--right",
        shouldShowPlayerChip && "brand-header--with-player",
      ].filter(Boolean).join(" ")}
    >
      {shouldShowPlayerChip && (
        <div className="brand-header__player-chip">
          <EquippedProfileFrame frame={profileFrame} size="sm" className="brand-header__player-frame">
            <div className="brand-header__player-avatar">
              {archetypeId ? (
                <img src={archetypeAssets[archetypeId].avatar.sm} alt="" />
              ) : (
                <span className="brand-header__player-avatar-empty">?</span>
              )}
            </div>
          </EquippedProfileFrame>
          <div className="brand-header__player-meta">
            <span className="brand-header__player-name">{displayName}</span>
            <span className="brand-header__player-score">{formatBrandScore(score)} очков</span>
          </div>
        </div>
      )}
      {effectiveShowIcon && (
        <div className="brand-header__icon">
          {iconVariant === "sphere" ? <SphereGlyph /> : <CubeGlyph />}
        </div>
      )}
      <div className={`brand-header__text${align === "right" ? " brand-header__text--right" : ""}`}>
        {effectiveWordmarkVariant === "split" ? (
          <div className="brand-header__name">
            <span className="brand-header__crypto">CRYPTO</span>
            <span className="brand-header__reality">REALITY</span>
          </div>
        ) : (
          <div
            className={`brand-header__name brand-header__name--${effectiveWordmarkVariant}`}
          >
            CRYPTO REALITY
          </div>
        )}
        <span className="brand-header__sub">— ВЫЖИВИ ДО ПЯТНИЦЫ —</span>
      </div>
    </div>
  );
}

function formatBrandScore(score: number | undefined): string {
  if (typeof score !== "number" || !Number.isFinite(score)) return "—";
  return Math.round(score).toLocaleString("ru-RU");
}
