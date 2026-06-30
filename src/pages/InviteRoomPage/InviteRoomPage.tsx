import { useState } from "react";
import { HoloCube } from "../../shared/ui/HoloCube/HoloCube";
import type { ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { useAppContext } from "../../store/AppContext";
import { buildInviteLink, shareUrlToTelegram } from "../../telegram/webapp";
import { notifyError, notifyInfo, notifySuccess } from "../../shared/notifications/notify";
import { shareGameCard } from "../../shared/shareCards/shareGameCard";
import { EquippedMarketBadge } from "../../features/market/components/EquippedMarketBadge";
import { EquippedRoomThemeShell } from "../../features/market/components/EquippedRoomThemeShell";
import {
  getArchetypeAssetsWithSkin,
  getEquippedRoomTheme,
  getEquippedShareCardTemplate,
  getSkinCutoutOverrides,
  getMarketItemClassToken,
} from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import type { RoomDTO } from "../../api/types";
import "./InviteRoomPage.css";

const HOW_STEPS = [
  {
    num: 1,
    title: "Отправь код или ссылку",
    desc: "Поделись с друзьями удобным способом.",
  },
  {
    num: 2,
    title: "Друзья выберут архетип",
    desc: "Каждый зайдёт в комнату и подготовит персонажа.",
  },
  {
    num: 3,
    title: "Игра стартует, когда ты её начнёшь",
    desc: "Запустить может только создатель комнаты.",
  },
];

export interface InviteRoomPageProps {
  room?: RoomDTO | null;
  onBack?: () => void;
}

export function InviteRoomPage({ room, onBack }: InviteRoomPageProps) {
  const { state } = useAppContext();
  const archetypeId = (state.currentParticipant?.archetype_slug ?? undefined) as ArchetypeId | undefined;
  const { data: equippedItemsData } = useEquippedItems();

  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const isLobbyStatus = room?.status === "lobby";
  const roomName = room?.title ?? "Моя комната";
  const roomCode = room?.invite_code ?? "------";
  // Bot deep-link (?start=), not direct ?startapp= — see buildInviteLink for why:
  // it always opens via the bot's runtime MINIAPP_URL instead of depending on
  // BotFather's (not-kept-in-sync-with-the-tunnel) Mini App URL.
  const inviteLink = buildInviteLink(roomCode);
  const inviteLinkDisplay = inviteLink.replace(/^https:\/\//, "");
  const spaceCode = roomCode.split("").join(" ");
  const shareText = `Присоединяйся к моей комнате «${roomName}» в Crypto Reality!`;
  const equippedItems = equippedItemsData?.items ?? [];
  const shareTemplate = getEquippedShareCardTemplate(equippedItems);
  const roomTheme = getEquippedRoomTheme(equippedItems);
  const shareTemplateToken = getMarketItemClassToken(shareTemplate?.item.slug);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(roomCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareFallback = () => {
    shareUrlToTelegram(inviteLink, shareText);
  };

  const handleShareTelegram = async () => {
    try {
      const result = await shareGameCard({
        kind: "invite",
        archetypeId,
        roomCode,
        title: "ЗОВИ В КОМНАТУ",
        subtitle: "ПРИСОЕДИНЯЙСЯ К CRYPTO REALITY",
        footer: "CRYPTO REALITY · ПРИГЛАШЕНИЕ В КОМНАТУ",
        link: inviteLink,
        shareText,
        templateSlug: shareTemplate?.item.slug ?? null,
        skinCutouts: getSkinCutoutOverrides(equippedItems, archetypeId),
      });
      if (result === "downloaded") {
        notifyInfo("Карточка сохранена", "Файл скачан. Отправь его вместе со ссылкой на комнату.");
        handleShareFallback();
      } else {
        notifySuccess("Карточка готова", "Открылось системное меню шаринга.");
      }
    } catch {
      notifyError("Не удалось создать карточку", "Отправлю обычную ссылку на комнату.");
      handleShareFallback();
    }
  };

  const assets = archetypeId ? getArchetypeAssetsWithSkin(archetypeId, equippedItems) : undefined;

  return (
    <main className="inv">

      {/* ── Header ── */}
      <header className="inv__header">
        <button className="inv__icon-btn" type="button" aria-label="Назад" onClick={onBack}>
          <ArrowLeftIcon size={20} />
        </button>
        <BrandHeader />
        <span className="inv__header-spacer" aria-hidden="true" />
      </header>

      <div className="inv__frame">

        {/* ── Title ── */}
        <div className="inv__title-block">
          <div className="inv__title-row">
            <div className="inv__title-line" />
            <h1 className="inv__page-title">INVITE PLAYERS</h1>
            <div className="inv__title-line" />
          </div>
          <p className="inv__page-sub">— ПРИГЛАСИ ДРУЗЕЙ —</p>
          <p className="inv__subtitle">
            Поделись кодом комнаты или ссылкой и собери команду к старту сезона.
          </p>
        </div>

        {/* ── ВАША КОМНАТА ── */}
        <EquippedRoomThemeShell theme={roomTheme} className="inv__market-theme-shell">
          {(roomTheme || shareTemplate) && (
            <div className="inv__market-badges">
              <EquippedMarketBadge label="Тема" item={roomTheme} />
              <EquippedMarketBadge
                label="Шаблон приглашения"
                item={shareTemplate}
                emptyText="Classic Invite Card"
              />
            </div>
          )}
        <section className={`inv__card inv__card--purple${shareTemplateToken ? ` market-share-card--${shareTemplateToken}` : ""}`}>
          <div className="inv__card-label inv__card-label--purple">ВАША КОМНАТА</div>

          <div className="inv__room-header">
            {assets && (
              <div className="inv__room-avatar">
                <img src={assets.avatar.sm} alt="" />
              </div>
            )}
            <div className="inv__room-meta">
              <span className="inv__room-name">{roomName}</span>
              <span className="inv__lobby-badge">{isLobbyStatus ? "ЛОББИ" : "ИГРА ИДЁТ"}</span>
            </div>
          </div>

          <div className="inv__card-divider" />

          <div className="inv__field-group">
            <span className="inv__field-label">КОД КОМНАТЫ</span>
            <div className="inv__code-row">
              <span className="inv__code">{spaceCode}</span>
              <button
                className={`inv__copy-btn ${codeCopied ? "inv__copy-btn--done" : ""}`}
                type="button"
                onClick={handleCopyCode}
                aria-label="Скопировать код"
              >
                {codeCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </div>
          </div>

          <div className="inv__field-group">
            <span className="inv__field-label">ССЫЛКА-ПРИГЛАШЕНИЕ</span>
            <div className="inv__link-row">
              <span className="inv__link-text">{inviteLinkDisplay}</span>
              <button
                className={`inv__copy-btn ${linkCopied ? "inv__copy-btn--done" : ""}`}
                type="button"
                onClick={handleCopyLink}
                aria-label="Скопировать ссылку"
              >
                {linkCopied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              </button>
            </div>
          </div>

          {!isLobbyStatus && (
            <p className="inv__helper">
              Игра уже началась — новые участники присоединятся и начнут сразу с текущего дня.
            </p>
          )}
        </section>
        </EquippedRoomThemeShell>

        {/* ── Actions ── */}
        <div className="inv__actions">
          <button
            className="inv__action-btn inv__action-btn--tg"
            type="button"
            onClick={handleShareTelegram}
          >
            <TelegramIcon size={20} />
            ПОДЕЛИТЬСЯ В TELEGRAM
          </button>
          <button
            className="inv__action-btn inv__action-btn--ghost"
            type="button"
            onClick={handleCopyLink}
          >
            <CopyIcon size={17} />
            СКОПИРОВАТЬ ССЫЛКУ
          </button>
        </div>

        {/* ── КАК ЭТО РАБОТАЕТ ── */}
        {isLobbyStatus && (
          <section className="inv__card inv__card--green">
            <div className="inv__how-header">
              <div className="inv__card-label inv__card-label--green">КАК ЭТО РАБОТАЕТ</div>
              <div className="inv__how-cube">
                <HoloCube size={52} />
              </div>
            </div>
            <div className="inv__how-steps">
              {HOW_STEPS.map((s) => (
                <div key={s.num} className="inv__how-step">
                  <div className="inv__how-num">{s.num}</div>
                  <div className="inv__how-title">{s.title}</div>
                  <div className="inv__how-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="inv__disclaimer">◇ Игровой сценарий. Не финансовый совет.</p>

      </div>
    </main>
  );
}

/* ── Inline SVG Icons ── */

function ArrowLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
