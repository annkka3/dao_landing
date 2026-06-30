import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type CSSProperties } from "react";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { useAppContext } from "../../store/AppContext";
import { getFinalResult, getLeaderboard } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { ApiError } from "../../api/errors";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { notifyError, notifyInfo, notifyOnce, notifySuccess } from "../../shared/notifications/notify";
import { getTelegramBotLink, shareUrlToTelegram } from "../../telegram/webapp";
import { EquippedMarketBadge } from "../../features/market/components/EquippedMarketBadge";
import {
  getArchetypeAssetsWithSkin,
  getEquippedShareCardTemplate,
  getSkinCutoutOverrides,
} from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import type { FinalResultSnapshotDailyEntry, LeaderboardEntryDTO, ScoreBonusDTO } from "../../api/types";
import { shareGameCard, type ShareGameCardKind } from "../../shared/shareCards/shareGameCard";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./FinalResultPage.css";

const FINAL_PENDING_BACKGROUND_SRC = "/assets/backgrounds/room_max_9x19.webp";
const FINAL_DAO_COIN_SRC = "/assets/logos/dao_coin.png";
const FINAL_BRAIN_SRC = "/assets/logos/brain.png";

const SEASON_TITLES = [
  {
    title: "ПОСЛЕДНИЙ РОМАНТИК АЛЬТСЕЗОНА",
    subtitle: "Ты верил в невозможное, когда все искали быстрый вход.",
  },
  {
    title: "ПИЛОТ КРИПТО-ХАОСА",
    subtitle: "Ты прошёл турбулентность рынка и не потерял управление.",
  },
  {
    title: "DAO-СТРАТЕГ НЕДЕЛИ",
    subtitle: "Ты считал риски там, где чат считал только ракеты.",
  },
  {
    title: "ХРАНИТЕЛЬ ПЯТНИЧНОГО НЕРВА",
    subtitle: "Ты дошёл до финала без полной капитуляции.",
  },
  {
    title: "ДЕГЕН ПОД НАБЛЮДЕНИЕМ",
    subtitle: "Внутренний хаос был рядом, но ты держал его на поводке.",
  },
  {
    title: "ОХОТНИК ЗА ЗЕЛЁНОЙ СВЕЧОЙ",
    subtitle: "Ты искал преимущество даже там, где рынок шумел громче логики.",
  },
  {
    title: "АРХИТЕКТОР ХОЛОДНОЙ ГОЛОВЫ",
    subtitle: "Ты строил решения на выдержке, а не на громкости чата.",
  },
  {
    title: "ВЫЖИВШИЙ ДО ЗАКРЫТИЯ СВЕЧИ",
    subtitle: "Сезон был шумным, но ты остался в игре до конца.",
  },
];

const FINAL_HERO_PARTICLES: Array<{
  left: number;
  top: number;
  duration: number;
  delay: number;
  tone: "rank" | "cyan" | "gold";
}> = [
  { left: 10, top: 18, duration: 7.2, delay: -1.1, tone: "gold" },
  { left: 18, top: 58, duration: 8.4, delay: -3.4, tone: "rank" },
  { left: 29, top: 26, duration: 6.8, delay: -2.2, tone: "cyan" },
  { left: 42, top: 74, duration: 9.1, delay: -4.8, tone: "gold" },
  { left: 58, top: 16, duration: 7.8, delay: -1.9, tone: "rank" },
  { left: 72, top: 48, duration: 8.9, delay: -5.2, tone: "cyan" },
  { left: 86, top: 24, duration: 7.5, delay: -2.8, tone: "gold" },
  { left: 91, top: 68, duration: 9.6, delay: -6.1, tone: "rank" },
];

const SEASON_WISDOM = {
  strong: [
    "Ты выжил до пятницы. Рынок шумел, чат горел, но ты дошёл.",
    "Сезон закрыт. Деген внутри не исчез, но теперь он хотя бы под наблюдением.",
    "Неделя проверила тебя на FOMO, стресс и жадность. Ты не развалился — уже победа.",
    "Ты прошёл путь от «что происходит?» до «я хотя бы понимаю, где я ошибся».",
    "Пятница достигнута. Можно выдохнуть и сделать вид, что всё было под контролем.",
    "Ты не просто выжил — ты собрал очки, выводы и пару внутренних шрамов.",
    "Сезон закончен. Портфель воображаемый, эмоции настоящие.",
    "Семь дней крипто-хаоса позади. Чат помнит всё, но ты стал умнее.",
    "Ты дошёл до финала без полной капитуляции. Это уже редкий NFT характера.",
    "Рынок пытался тебя раскачать. Ты научился не падать с первого пампа.",
    "Финальная свеча закрыта. Теперь видно, где была стратегия, а где просто вера в мемы.",
    "Неделя закончилась. Внутренний Risk Manager стал сильнее, внутренний Деген — осторожнее.",
    "Ты пережил слухи, пампы, просадки и советы из чата. Добро пожаловать в пятницу.",
    "Сезон пройден. Не идеально, зато живой, опытный и с историей.",
    "Ты стал тем игроком, который уже не верит каждому «брат, инфа сотка».",
  ],
  mixed: [
    "Сезон был неровный, как график после новости без источника.",
    "Были зелёные дни, были красные. Главное — ты не вышел из комнаты через окно.",
    "Неделя получилась не идеальной, но полезной. Особенно для дисциплины и нервной системы.",
    "Ты не всегда выбирал правильно, зато теперь видишь, где тебя уносит.",
    "Сезон прошёл в режиме «ошибся — понял — снова ошибся, но уже сложнее».",
    "Результат смешанный, но прогресс заметен. В крипте это уже почти дзен.",
    "Часть решений была сильной, часть — из отдела «зачем я это нажал?».",
    "Неделя показала: ты умеешь держаться, но иногда споришь с рынком слишком лично.",
    "Сезон не стал легендой, но стал хорошей тренировкой.",
    "Ты выжил, сделал выводы и не превратил каждую ошибку в драму. Засчитано.",
    "Финал не идеальный, но честный. А честность в крипте — редкая валюта.",
    "Было всякое: альфа, шум, стресс, надежда и желание переименовать кнопки.",
    "Ты не сломался, но пару раз рынок явно держал тебя за капюшон.",
    "Сезон закрыт. Есть над чем работать, но база уже есть.",
    "Не каждый день был зелёным, зато каждый день что-то показал.",
  ],
  hard: [
    "Неделя была тяжёлой, но ты дошёл. Иногда это уже главная победа.",
    "Рынок забрал очки, но не забрал способность делать выводы.",
    "Сезон был краснее, чем хотелось. Зато теперь понятно, где живёт тильт.",
    "Это был не провал. Это был платный урок, просто валюта — игровые очки и нервы.",
    "Ты прошёл через просадки, ошибки и внутреннего ковбоя с плечом. Выжил — значит, продолжаем.",
    "Финал суровый, но честный. Крипто-хаос не прощает автопилот.",
    "Эта неделя показала, где стратегия заканчивается и начинается «а вдруг повезёт».",
    "Результат тяжёлый, но полезный: теперь враг не рынок, а импульс внутри.",
    "Сезон не пощадил. Но следующий можно пройти холоднее.",
    "Иногда пятница приходит не с кубком, а с блокнотом ошибок.",
    "Неделя была красной, но не бессмысленной.",
    "Ты не обязан выиграть каждую неделю. Но обязан понять, где тебя вынесло.",
    "Рынок сегодня смеялся громче. В следующий раз пусть смеётся тише.",
    "Сезон закрылся больно. Зато теперь у тебя есть карта минных полей.",
    "Капитуляционный Думер уже писал некролог, но ты всё ещё здесь.",
  ],
  comeback: [
    "Начало было тревожным, но финал сказал: «рано хоронили».",
    "Ты начал с просадки, а закончил с характером.",
    "Сезон пытался сломать тебя в начале. Не вышло.",
    "Вот это уже похоже на камбэк, а не на случайный зелёный день.",
    "Ты выбрался из красной зоны без магии, только решениями.",
    "Сначала было больно, потом стало понятно. Хороший сценарий роста.",
    "Ты не запаниковал после ошибок — и именно поэтому финал стал сильнее.",
    "Просадка была вступлением, не концовкой.",
    "Неделя началась как хоррор, но закончилась как история выживания.",
    "Ты не дал первым ошибкам написать весь сезон за тебя.",
    "Красные дни были, но ты не остался в них жить.",
    "Комната видела падение. Теперь видит возвращение.",
    "Это не «повезло». Это ты перестал мешать себе.",
    "Сезон доказал: даже после плохого входа можно сыграть умнее.",
    "Камбэк принят. Дегену валидол, Risk Manager — медаль.",
  ],
} as const;

type SeasonWisdomTone = keyof typeof SEASON_WISDOM;

export interface FinalResultPageProps {
  onPlayAgain?: () => void;
  onOpenDayResult?: (dayNumber: number) => void;
}

function isFinalResultPendingError(error: unknown): boolean {
  return (
    ApiError.isApiError(error) &&
    (error.code === "FINAL_RESULT_NOT_READY" || error.code === "FINAL_RESULT_NOT_FOUND")
  );
}

export function FinalResultPage({ onPlayAgain, onOpenDayResult }: FinalResultPageProps) {
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [sharingCard, setSharingCard] = useState<ShareGameCardKind | null>(null);
  const { state } = useAppContext();
  const room = state.currentRoom;
  const participant = state.currentParticipant;
  const archetypeId = (participant?.archetype_slug ?? undefined) as ArchetypeId | undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: QK.finalResult,
    queryFn: getFinalResult,
  });

  const { data: leaderboard } = useQuery({
    queryKey: room ? QK.leaderboard(room.public_id) : ["leaderboard", "pending"],
    queryFn: () => getLeaderboard(room!.public_id),
    enabled: room != null,
  });
  const { data: equippedItemsData } = useEquippedItems();

  useEffect(() => {
    if (!data) return;

    const roomKey = room?.public_id ?? "unknown_room";
    const key = `crypto_reality_notified_final_result_${roomKey}`;
    notifyOnce(key, {
      kind: "info",
      haptic: "success",
      title: "Финал сезона готов",
      message: "Проверь итоговые очки, бонусы и номинации.",
      ttlMs: 5_000,
    });
  }, [data, room?.public_id]);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError) {
    if (isFinalResultPendingError(error)) {
      return <FinalResultPendingState />;
    }

    return (
      <ErrorState
        title="Результат пока недоступен"
        message={friendlyErrorMessage(error, "Финальный результат сезона ещё не готов.")}
        action={onPlayAgain && <button type="button" onClick={onPlayAgain}>К комнате</button>}
      />
    );
  }

  if (!data) {
    return <FinalResultPendingState />;
  }

  const equippedItems = equippedItemsData?.items ?? [];
  const assets = archetypeId ? getArchetypeAssetsWithSkin(archetypeId, equippedItems) : undefined;
  const seasonWisdom = selectSeasonWisdom(
    data.final_score,
    data.final_rank,
    data.results_snapshot?.daily_results ?? []
  );
  const rankPresentation = finalRankPresentation(data.final_rank);
  const seasonTitle = selectSeasonTitle(
    data.final_score,
    data.final_rank,
    archetypeId,
    data.results_snapshot?.daily_results ?? []
  );
  const finalBonusTotal = finalBonusTotalFromSnapshot(
    data.results_snapshot?.final_bonus_total,
    data.results_snapshot?.final_bonuses
  );
  const dailyResults = data.results_snapshot?.daily_results ?? [];
  const eventsSummary = data.results_snapshot?.events_summary;
  const positiveDays = dailyResults.filter((day) => day.score_delta > 0).length;
  const topPlayers = buildTopPlayers(leaderboard?.entries ?? []);
  const shareText = `Мой финал в Crypto Reality: ${rankPresentation.headline} · ${formatSignedScore(data.final_score)} очков`;
  const shareLink = getTelegramBotLink();
  const shareTemplate = getEquippedShareCardTemplate(equippedItems);
  const handleShareFallback = () => {
    shareUrlToTelegram(shareLink, shareText);
  };

  const handleShareCard = async (kind: ShareGameCardKind) => {
    setSharingCard(kind);
    try {
      const wildMoment = selectWildMoment(dailyResults);
      const result = await shareGameCard({
        kind,
        archetypeId,
        rank: data.final_rank,
        rankTotal: leaderboard?.total_participants,
        rankTone: rankPresentation.tone,
        score: data.final_score,
        title: shareCardTitle(kind, rankPresentation.headline, seasonTitle.title, wildMoment.title),
        subtitle: shareCardSubtitle(kind, seasonTitle.subtitle, seasonWisdom.text),
        description: wildMoment.description,
        stats: data.final_stats,
        nominations: data.final_nominations ?? data.results_snapshot?.final_bonuses ?? [],
        footer: shareCardFooter(kind),
        link: shareLink,
        shareText: shareCardShareText(kind),
        templateSlug: shareTemplate?.item.slug ?? null,
        skinCutouts: getSkinCutoutOverrides(equippedItems, archetypeId),
      });

      if (result === "downloaded") {
        notifyInfo("Карточка сохранена", "Файл скачан. Его можно отправить друзьям вручную.");
      } else {
        notifySuccess("Карточка готова", "Открылось системное меню шаринга.");
      }
      setShareMenuOpen(false);
    } catch {
      notifyError("Не удалось создать карточку", "Отправлю обычную ссылку на результат.");
      handleShareFallback();
    } finally {
      setSharingCard(null);
    }
  };

  return (
    <main className="sf sf--final">

      {/* ── Header ── */}
      <header className="sf__header">
        <div className="sf__header-row">
          <BrandHeader />
        </div>
      </header>

      <div className="sf__frame">

        {/* ── Final hero ── */}
        <div
          className={`sf__final-hero sf__final-hero--${rankPresentation.tone}`}
          style={{ "--final-bg": `url("${rankPresentation.background}")`, "--rank-tone": rankPresentation.color } as CSSProperties}
        >
          <div className="sf__final-hero-bg" aria-hidden="true" />
          <div className="sf__final-hero-scan" aria-hidden="true" />
          {FINAL_HERO_PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`sf__final-hero-particle sf__final-hero-particle--${p.tone}`}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
              aria-hidden="true"
            />
          ))}
          {assets && (
            <img
              className="sf__final-hero-character"
              src={assets.cutout.win}
              alt=""
            />
          )}
          <div className="sf__final-hero-copy">
            <span className="sf__final-kicker">СЕЗОН ЗАВЕРШЁН!</span>
            <h1 className="sf__final-headline">{rankPresentation.headline}</h1>
            <p className="sf__final-caption">Ты прошёл путь до пятницы. Время подвести итоги.</p>

            <div className="sf__final-rank-card">
              <span className="sf__final-rank-label">ТВОЁ МЕСТО</span>
              <span className="sf__final-rank-value">{data.final_rank}</span>
              {leaderboard && <span className="sf__final-rank-total">из {leaderboard.total_participants} игроков</span>}
            </div>

            <div className="sf__final-score-card">
              <span className="sf__final-score-label">ИТОГОВЫЙ СЧЁТ</span>
              <span className="sf__final-score-value">{formatSignedScore(data.final_score)}</span>
            </div>
          </div>
        </div>

        <div className="sf__title-card">
          <div className="sf__title-medallion" aria-hidden="true">
            <MoonBadgeIcon size={52} />
          </div>
          <div className="sf__title-body">
            <span className="sf__title-kicker">ТВОЙ ТИТУЛ СЕЗОНА</span>
            <h2 className="sf__title-name">{seasonTitle.title}</h2>
            <p className="sf__title-desc">{seasonTitle.subtitle}</p>
          </div>
        </div>

        <div className="sf__split-cards">
          <div className="sf__bonus-card">
            <div className="sf__bonus-copy">
              <span className="sf__bonus-kicker">ФИНАЛЬНЫЕ БОНУСЫ</span>
              <span className="sf__bonus-value">{formatSignedScore(finalBonusTotal)}</span>
              <span className="sf__bonus-note">Итоговая сумма бонусов сезона</span>
            </div>
            <img className="sf__bonus-coin" src={FINAL_DAO_COIN_SRC} alt="" />
          </div>

          <div className={`sf__wisdom-card sf__wisdom-card--${seasonWisdom.tone}`}>
            <div className="sf__wisdom-copy">
              <span className="sf__wisdom-kicker">МУДРОСТЬ DAO</span>
              <p className="sf__wisdom-text">{seasonWisdom.text}</p>
            </div>
            <img className="sf__wisdom-brain" src={FINAL_BRAIN_SRC} alt="" />
          </div>
        </div>

        {/* ── Season summary ── */}
        <div className="sf__mid-grid">
          <div className="sf__top-card">
            <h2 className="sf__panel-title">ТОП ИГРОКОВ КОМНАТЫ</h2>
            <div className="sf__top-list">
              {topPlayers.map((entry, index) => {
                if (!entry) {
                  return (
                    <div key={`empty-${index}`} className="sf__top-row sf__top-row--empty">
                      <span className="sf__top-rank">{index + 1}</span>
                      <span className="sf__top-empty">-</span>
                      <span className="sf__top-score">-</span>
                    </div>
                  );
                }

                const rowAssets = getArchetypeAssets(entry.archetype_slug);
                return (
                  <div key={entry.participant_id} className="sf__top-row">
                    <span className={`sf__top-rank sf__top-rank--${index + 1}`}>{entry.rank}</span>
                    {rowAssets ? (
                      <img
                        className={`sf__top-avatar sf__top-avatar--${index + 1}`}
                        src={rowAssets.avatar.sm}
                        alt=""
                      />
                    ) : (
                      <span className="sf__top-avatar sf__top-avatar--empty" />
                    )}
                    <span className="sf__top-name">{entry.display_name}</span>
                    <span className="sf__top-score">{formatSignedScore(entry.score)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sf__journey-card">
            <h2 className="sf__panel-title">ТВОЙ ПУТЬ ЗА СЕЗОН</h2>
            <div className="sf__journey-grid">
              <div className="sf__journey-item sf__journey-item--green">
                <span className="sf__journey-icon"><LightningIcon size={20} /></span>
                <span className="sf__journey-label">РЕШЕНИЙ ПРИНЯТО</span>
                <span className="sf__journey-val">{eventsSummary?.completed ?? 0}</span>
              </div>
              <div className="sf__journey-item sf__journey-item--blue">
                <span className="sf__journey-icon"><TargetIcon size={20} /></span>
                <span className="sf__journey-label">ДНЕЙ В ПЛЮС</span>
                <span className="sf__journey-val">{positiveDays}</span>
              </div>
              <div className="sf__journey-item sf__journey-item--purple">
                <span className="sf__journey-icon"><StarIcon size={20} /></span>
                <span className="sf__journey-label">ВЕЧЕРНИХ БОНУСОВ</span>
                <span className="sf__journey-val">{eventsSummary?.evening_bonus_completed ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Season candle chart ── */}
        {dailyResults.length > 0 && (
          <div className="sf__candle-card">
            <h2 className="sf__panel-title sf__panel-title--center">ДИНАМИКА СЕЗОНА</h2>
            <SeasonCandleChart days={dailyResults} />
          </div>
        )}

        {/* ── Day-by-day results ── */}
        {dailyResults.length > 0 && (
          <div className="sf__daily-results-card">
            <h2 className="sf__panel-title sf__panel-title--center">РЕЗУЛЬТАТЫ ПО ДНЯМ</h2>
            <div className="sf__daily-results-list">
              {dailyResults.map((d) => {
                const tone = dailyDeltaTone(d.score_delta);
                const summary = dailyDeltaSummary(d.score_delta);
                const color = dailyDeltaColor(tone);
                const Icon = tone === "pos" ? TrendUpIcon : tone === "neg" ? TrendDownIcon : TrendFlatIcon;

                return (
                  <button
                    type="button"
                    key={d.day_number}
                    className={`sf__daily-row sf__daily-row--${tone}`}
                    style={{ "--day-tone": color } as CSSProperties}
                    onClick={() => onOpenDayResult?.(d.day_number)}
                  >
                    <span className="sf__daily-trend">
                      <Icon size={20} />
                    </span>
                    <span className="sf__daily-day">День {d.day_number}</span>
                    <span className="sf__daily-summary">{summary}</span>
                    <span className="sf__daily-score">{formatSignedScore(d.score_delta)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="sf__cta-row">
          <div className="sf__market-template-row">
            <EquippedMarketBadge
              label="Шаблон share-card"
              item={shareTemplate}
              emptyText="Classic Final Card"
            />
          </div>
          <button type="button" className="sf__cta sf__cta--share" onClick={() => setShareMenuOpen(true)}>
            <ShareIcon size={18} /> ПОДЕЛИТЬСЯ РЕЗУЛЬТАТОМ
          </button>
          <button type="button" className="sf__cta sf__cta--room" onClick={onPlayAgain}>
            <ChartIcon size={18} /> К КОМНАТЕ
          </button>
        </div>

        {shareMenuOpen && (
          <ShareCardPicker
            activeKind={sharingCard}
            onClose={() => setShareMenuOpen(false)}
            onSelect={handleShareCard}
          />
        )}
      </div>
    </main>
  );
}

function FinalResultPendingState() {
  return (
    <main className="sf sf--pending">
      <header className="sf__header">
        <div className="sf__header-row">
          <BrandHeader />
        </div>
      </header>

      <div className="sf__frame">
        <div className="sf__pending-title-row">
          <div className="sf__pending-title-line" />
          <h1 className="sf__pending-page-title">SEASON FINAL</h1>
          <div className="sf__pending-title-line" />
        </div>
        <p className="sf__pending-page-sub">— ФИНАЛ СЕЗОНА —</p>

        <div
          className="sf__pending-card sf__pending-card--scene"
          style={{ "--final-pending-bg": `url("${FINAL_PENDING_BACKGROUND_SRC}")` } as CSSProperties}
        >
          <div className="sf__pending-bg" aria-hidden="true" />
          <div className="sf__pending-icon"><LockIcon size={26} /></div>
          <h2 className="sf__pending-title">Считаем результаты игры</h2>
          <p className="sf__pending-desc">Дождитесь уведомления о результатах.</p>
        </div>
      </div>
    </main>
  );
}

type FinalRankTone = "first" | "second" | "third" | "all";

function finalRankPresentation(rank: number): {
  tone: FinalRankTone;
  headline: string;
  background: string;
  color: string;
} {
  if (rank === 1) {
    return {
      tone: "first",
      headline: "ПОБЕДА!",
      background: "/assets/backgrounds/final_first.PNG",
      color: "#ffd23f",
    };
  }

  if (rank === 2) {
    return {
      tone: "second",
      headline: "ТОП 3",
      background: "/assets/backgrounds/final_second.PNG",
      color: "#d6dde9",
    };
  }

  if (rank === 3) {
    return {
      tone: "third",
      headline: "ТОП 3",
      background: "/assets/backgrounds/final_third.PNG",
      color: "#cd7f32",
    };
  }

  return {
    tone: "all",
    headline: "МОЛОДЕЦ!",
    background: "/assets/backgrounds/final_all.PNG",
    color: "#ffffff",
  };
}

function selectSeasonTitle(
  finalScore: number,
  finalRank: number,
  archetypeId: ArchetypeId | undefined,
  days: FinalResultSnapshotDailyEntry[]
): { title: string; subtitle: string } {
  const seed = [
    archetypeId ?? "unknown",
    finalScore,
    finalRank,
    ...days.map((day) => `${day.day_number}:${day.score_delta}`),
  ].join("|");
  return SEASON_TITLES[stableIndex(seed, SEASON_TITLES.length)];
}

function finalBonusTotalFromSnapshot(
  snapshotTotal: number | undefined,
  bonuses: ScoreBonusDTO[] | undefined
): number {
  if (typeof snapshotTotal === "number") return snapshotTotal;
  return (bonuses ?? []).reduce((sum, bonus) => sum + bonus.points, 0);
}

function buildTopPlayers(entries: LeaderboardEntryDTO[]): Array<LeaderboardEntryDTO | null> {
  const top: Array<LeaderboardEntryDTO | null> = entries.slice(0, 3);
  while (top.length < 3) top.push(null);
  return top;
}

const FINAL_SHARE_OPTIONS: Array<{ kind: ShareGameCardKind; title: string; desc: string }> = [
  { kind: "season_title", title: "Финальный титул сезона", desc: "Герой, титул и легенда сезона." },
  { kind: "season_archetype", title: "Архетип сезона", desc: "Кем ты был в крипто-хаосе." },
  { kind: "season_result", title: "Финальный результат", desc: "Место, счет и финальный статус." },
  { kind: "wild_moment", title: "Безумный момент недели", desc: "Самый яркий поворот сезона." },
  { kind: "stats_summary", title: "Итог характеристик", desc: "RPG-карточка твоих статов." },
  { kind: "dao_nominations", title: "Номинации DAO", desc: "Бонусы и титулы комнаты." },
];

function ShareCardPicker({
  activeKind,
  onClose,
  onSelect,
}: {
  activeKind: ShareGameCardKind | null;
  onClose: () => void;
  onSelect: (kind: ShareGameCardKind) => void;
}) {
  return (
    <div className="sf__share-sheet" role="dialog" aria-modal="true" aria-label="Выбор карточки для шаринга">
      <button className="sf__share-sheet-backdrop" type="button" aria-label="Закрыть" onClick={onClose} />
      <div className="sf__share-sheet-panel">
        <div className="sf__share-sheet-head">
          <div>
            <span className="sf__share-sheet-kicker">ПОДЕЛИТЬСЯ ИСТОРИЕЙ</span>
            <h2>Выбери карточку</h2>
          </div>
          <button type="button" className="sf__share-sheet-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        <div className="sf__share-options">
          {FINAL_SHARE_OPTIONS.map((option) => (
            <button
              key={option.kind}
              type="button"
              className="sf__share-option"
              onClick={() => onSelect(option.kind)}
              disabled={activeKind != null}
            >
              <span className="sf__share-option-title">
                {activeKind === option.kind ? "Генерирую..." : option.title}
              </span>
              <span className="sf__share-option-desc">{option.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function selectWildMoment(days: FinalResultSnapshotDailyEntry[]): { title: string; description: string } {
  if (days.length === 0) {
    return {
      title: "ХАОС НЕДЕЛИ",
      description: "Сезон был шумным, и DAO точно есть что вспомнить.",
    };
  }

  const best = [...days].sort((a, b) => Math.abs(b.score_delta) - Math.abs(a.score_delta))[0];
  return {
    title: `ДЕНЬ ${best.day_number}: ${dailyDeltaSummary(best.score_delta).toUpperCase()}`,
    description: best.score_delta >= 0
      ? `${formatSignedScore(best.score_delta)} очков. Хаос дал шанс, и ты его забрал.`
      : `${formatSignedScore(best.score_delta)} очков. Рынок ударил громко, но история стала ярче.`,
  };
}

function shareCardTitle(
  kind: ShareGameCardKind,
  finalHeadline: string,
  seasonTitle: string,
  wildTitle: string
): string {
  if (kind === "season_title") return seasonTitle;
  if (kind === "season_result") return finalHeadline;
  if (kind === "wild_moment") return wildTitle;
  if (kind === "stats_summary") return "ИТОГ ХАРАКТЕРИСТИК";
  if (kind === "dao_nominations") return "НОМИНАЦИИ DAO";
  return "АРХЕТИП СЕЗОНА";
}

function shareCardSubtitle(kind: ShareGameCardKind, titleSubtitle: string, wisdom: string): string {
  if (kind === "season_title") return titleSubtitle;
  if (kind === "dao_nominations") return wisdom;
  if (kind === "season_result") return "Ты прошёл путь до пятницы. Время подвести итоги.";
  if (kind === "stats_summary") return "Рынок шумел, но характеристики остались в истории.";
  return "";
}

function shareCardFooter(kind: ShareGameCardKind): string {
  if (kind === "season_title") return "CRYPTO REALITY · ТИТУЛ СЕЗОНА";
  if (kind === "season_archetype") return "CRYPTO REALITY · АРХЕТИП СЕЗОНА";
  if (kind === "season_result") return "CRYPTO REALITY · ФИНАЛЬНЫЙ РЕЗУЛЬТАТ";
  if (kind === "wild_moment") return "CRYPTO REALITY · МОМЕНТ НЕДЕЛИ";
  if (kind === "stats_summary") return "CRYPTO REALITY · ИТОГ ХАРАКТЕРИСТИК";
  if (kind === "dao_nominations") return "CRYPTO REALITY · НОМИНАЦИИ DAO";
  return "CRYPTO REALITY · ВЫЖИВИ ДО ПЯТНИЦЫ";
}

function shareCardShareText(kind: ShareGameCardKind): string {
  if (kind === "season_title") return "Мой финальный титул сезона в Crypto Reality.";
  if (kind === "season_archetype") return "Я прожил неделю в Crypto Reality в своем архетипе.";
  if (kind === "season_result") return "Мой финальный результат сезона в Crypto Reality.";
  if (kind === "wild_moment") return "Самый безумный момент моей недели в Crypto Reality.";
  if (kind === "stats_summary") return "Итог моих характеристик после недели крипто-хаоса.";
  if (kind === "dao_nominations") return "Мои DAO-номинации сезона в Crypto Reality.";
  return "Моя история в Crypto Reality.";
}

function getArchetypeAssets(slug: string | null) {
  if (!slug || !isArchetypeId(slug)) return null;
  return archetypeAssets[slug];
}

function isArchetypeId(slug: string): slug is ArchetypeId {
  return slug in archetypeAssets;
}

/* ── Season candle chart ── */

const CANDLE_CHART_HEIGHT = 130; // px, shared vertical scale for every candle
const CANDLE_MIN_BODY_HEIGHT = 4; // px, keeps flat/zero days visible
const CANDLE_WICK_MIN = 3; // px
const CANDLE_WICK_MAX = 16; // px

// Deterministic per-candle "randomness" so wick length varies day to day
// (and top vs. bottom of the same candle) without flickering between renders.
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function SeasonCandleChart({ days }: { days: FinalResultSnapshotDailyEntry[] }) {
  // Real candlestick continuity: each day's open is the previous day's close.
  // total_score_after is already the running total ("close"); open is
  // recovered as close - delta, so day 1's open is implicitly 0.
  const candles = days.map((d) => ({
    day: d.day_number,
    delta: d.score_delta,
    open: d.total_score_after - d.score_delta,
    close: d.total_score_after,
  }));

  const allValues = candles.flatMap((c) => [c.open, c.close]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const valueRange = Math.max(1, maxVal - minVal);
  const toPx = (value: number) => ((value - minVal) / valueRange) * CANDLE_CHART_HEIGHT;

  return (
    <div className="sf__candle-chart">
      {candles.map((c) => {
        const isPositive = c.delta >= 0;
        const tone = isPositive ? "pos" : "neg";
        const bodyTop = Math.max(c.open, c.close);
        const bodyBottom = Math.min(c.open, c.close);
        const bodyBottomPx = toPx(bodyBottom);
        const bodyHeightPx = Math.max(CANDLE_MIN_BODY_HEIGHT, toPx(bodyTop) - bodyBottomPx);
        const topWick = CANDLE_WICK_MIN + pseudoRandom(c.day) * (CANDLE_WICK_MAX - CANDLE_WICK_MIN);
        const bottomWick = CANDLE_WICK_MIN + pseudoRandom(c.day + 0.5) * (CANDLE_WICK_MAX - CANDLE_WICK_MIN);

        return (
          <div key={c.day} className="sf__candle-col">
            <span className={`sf__candle-value sf__candle-value--${tone}`}>
              {isPositive ? "+" : ""}{c.delta}
            </span>
            <div className="sf__candle-bar-wrap" style={{ height: CANDLE_CHART_HEIGHT }}>
              <div
                className={`sf__candle-wick sf__candle-wick--${tone}`}
                style={{ bottom: bodyBottomPx - bottomWick, height: bodyHeightPx + topWick + bottomWick }}
              />
              <div
                className={`sf__candle-bar sf__candle-bar--${tone}`}
                style={{ bottom: bodyBottomPx, height: bodyHeightPx }}
              />
            </div>
            <span className="sf__candle-day">Д{c.day}</span>
          </div>
        );
      })}
    </div>
  );
}

type DailyDeltaTone = "pos" | "neg" | "flat";

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

function selectSeasonWisdom(
  finalScore: number,
  finalRank: number,
  days: FinalResultSnapshotDailyEntry[]
): { tone: SeasonWisdomTone; text: string } {
  const tone = seasonWisdomTone(finalScore, finalRank, days);
  const phrases = SEASON_WISDOM[tone];
  const seed = [
    finalScore,
    finalRank,
    ...days.map((d) => `${d.day_number}:${d.score_delta}`),
  ].join("|");

  return {
    tone,
    text: phrases[stableIndex(seed, phrases.length)],
  };
}

function seasonWisdomTone(
  finalScore: number,
  finalRank: number,
  days: FinalResultSnapshotDailyEntry[]
): SeasonWisdomTone {
  const firstDay = days.find((d) => d.day_number === 1) ?? days[0];
  const negativeDays = days.filter((d) => d.score_delta < 0).length;
  const totalDelta = days.reduce((sum, day) => sum + day.score_delta, 0);

  if (firstDay && firstDay.score_delta <= -20 && finalScore >= 30 && totalDelta > firstDay.score_delta) {
    return "comeback";
  }
  if (finalScore < 0 || negativeDays >= Math.ceil(days.length / 2)) {
    return "hard";
  }
  if (finalRank <= 3 || finalScore >= 100 || totalDelta >= 120) {
    return "strong";
  }
  return "mixed";
}

function stableIndex(seed: string, length: number): number {
  if (length <= 1) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

/* ── Icons ── */

function LockIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect className="sf__lock-body" x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path className="sf__lock-shackle" d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrendUpIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendDownIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8l5 5 4-4 7 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 17h5v-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendFlatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V3M12 3l-4 4M12 3l4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12v7h14v-7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LightningIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L4 13h7l-1 9 10-13h-7V2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function MoonBadgeIcon({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <circle cx="32" cy="32" r="21" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <path d="M39 18c-8 1.7-13.4 8.3-13.4 15.5 0 5.4 3.1 10 7.4 12.2C23.8 45.2 17 38.8 17 31.1 17 23.5 23.8 17.6 31 18.1c3 .2 5.4 1.1 8 0z" fill="currentColor" opacity="0.82" />
      <path d="M47 26l1.3 3.1 3.2.8-3.2 1.1L47 34l-1.3-3-3.2-1.1 3.2-.8L47 26zM17 17l.8 1.9 2 .5-2 .7-.8 1.9-.8-1.9-2-.7 2-.5.8-1.9zM48 43l.8 1.9 2 .5-2 .7-.8 1.9-.8-1.9-2-.7 2-.5.8-1.9z" fill="currentColor" />
    </svg>
  );
}

function TargetIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
