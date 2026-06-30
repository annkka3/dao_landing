import { useEffect, useState, type CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ArchetypeId } from "../../shared/assets/archetypeAssets";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getArchetypes, getDailyResult, getDailyResults, getGameState } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { EVENT_ORDER, EVENT_TYPE_LABELS, STAT_LABELS } from "../../features/game/gameState";
import { notifyError, notifyInfo, notifySuccess } from "../../shared/notifications/notify";
import { getTelegramBotLink, shareUrlToTelegram } from "../../telegram/webapp";
import { shareGameCard } from "../../shared/shareCards/shareGameCard";
import { EquippedMarketBadge } from "../../features/market/components/EquippedMarketBadge";
import {
  getArchetypeAssetsWithSkin,
  getEquippedShareCardTemplate,
  getSkinCutoutOverrides,
} from "../../features/market/equipped";
import { useEquippedItems } from "../../features/market/hooks";
import type { DailyResultDTO, EventType, ScoreBonusDTO, StatsDTO } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import "./DayRecapPage.css";

interface EventSnapshotEntry {
  status?: string;
  choice_id?: number;
  score_delta?: number;
}

type DayTone = "positive" | "smallNegative" | "bigNegative" | "flat";

const DAY_AFTERTASTE: Record<DayTone, string[]> = {
  positive: [
    "Зелёная свеча дня зажглась. Не благодари рынок — благодари дисциплину.",
    "Сегодня ты не просто выжил. Ты ещё и вынес из хаоса пару очков.",
    "День закрыт в плюс. Внутренний деген временно поставлен на паузу.",
    "Рынок шумел, чат кричал, а ты всё равно забрал своё.",
    "Плюс есть плюс. Даже если он пришёл через стресс, чай и лёгкое подёргивание глаза.",
    "Сегодня решения были сильнее FOMO.",
    "Капитал не убежал. Репутация не сгорела. Уже неплохо.",
    "День прошёл зелёным. Можно выдохнуть, но не включать режим гения.",
    "Ты поймал ритм. Главное — не начать танцевать на кнопке «всё в одну сделку».",
    "Хороший день: меньше паники, больше смысла.",
    "Сегодня рынок был не врагом, а странным партнёром по танцу.",
    "Зелёный результат принят. Самооценку не разгоняем до 200x.",
    "Ты сделал то, что редко удаётся в крипте: не испортил хороший день.",
    "Плюс на табло. Внутренний Мун-пророк доволен, Risk Manager пока не плачет.",
    "День закончился лучше, чем начинался. Для крипты это почти духовная практика.",
  ],
  smallNegative: [
    "Минус есть, но это ещё не катастрофа. Это рынок постучал линейкой по пальцам.",
    "Красная свеча дня не приговор. Это напоминание: кнопки не любят эмоции.",
    "День слегка укусил. Значит, завтра заходим без героизма.",
    "Потеря контролируемая. Главное — не превращать её в сезонный сериал.",
    "Минус небольшой, но урок громкий.",
    "Рынок сказал: «Подумай ещё раз». Лучше услышать сейчас, чем в финале.",
    "Сегодня хаос выиграл раунд, но не сезон.",
    "День не идеальный. Зато отличный материал для внутреннего аудита.",
    "Небольшая просадка — это не драма, если не добавить к ней реванш.",
    "Минус принят. Валидол открыт. Деген пристёгнут.",
    "Красный день, но без пожара. Пожарные пока просто рядом стоят.",
    "Ошибка зафиксирована. Паническая музыка не включается.",
    "Сегодня рынок был грубоват. Завтра отвечаем не обидой, а планом.",
    "Минус — это не «я плохой игрок». Это «я получил обратную связь с неоном».",
    "День прошёл красным, но сезон ещё дышит.",
  ],
  bigNegative: [
    "Это был тяжёлый день. Не делай вид, что это «просто волатильность характера».",
    "Красная свеча получилась с характером. Теперь главное — не кормить её реваншем.",
    "Рынок сегодня выписал штраф. Оплачиваем выводами, не эмоциями.",
    "День ударил больно, но сезон ещё не закрыт.",
    "Если внутри проснулся Leverage Cowboy — уложи его спать.",
    "Просадка серьёзная. Самое время включить Risk Manager, а не драматическую музыку.",
    "Сегодня хаос был громче тебя. Завтра можно стать тише, но точнее.",
    "Минус большой, но не вечный. Вечный только скриншот в чате, если ты натворишь глупостей.",
    "День почти устроил ликвидацию настроения. Держим остатки дисциплины.",
    "Рынок нажал «проверить на прочность». Ты ещё в игре.",
    "Красный день — не конец. Конец — это когда ты перестал делать выводы.",
    "Сегодня было больно. Но боль без анализа — просто контент для мемов.",
    "Минус принят. Теперь запрещено мстить рынку, чату и собственному эго.",
    "Вечером лучше чай, чем реванш. И да, можно с валокордином для атмосферы.",
    "День не задался. Зато теперь понятно, где у системы тонкое место.",
  ],
  flat: [
    "Ноль — это не скучно. Это когда хаос пытался, но не смог.",
    "День без движения. Зато без пожара.",
    "Ты не заработал очков, но и не подарил их рынку. Уже стратегия.",
    "Иногда лучший ход — не нажать лишнюю кнопку.",
    "Сегодня рынок шумел, а ты сохранил лицо и статистику.",
    "Нулевая свеча. Внутренний деген недоволен, дисциплина аплодирует.",
    "День прошёл в режиме «смотрю, думаю, не лезу».",
    "Ничья с рынком. В крипте это почти дипломатическая победа.",
    "Баланс не вырос, но и не улетел в астрал.",
    "День ожидания. Иногда терпение тоже фармит очки.",
    "Ноль на табло, но нервная система говорит спасибо.",
    "Сегодня ты не стал главным героем катастрофы. Уже хорошо.",
    "Рынок не дал подарков, но и кошелёк не съел.",
    "Спокойный день. Подозрительно, но приятно.",
    "Ничего не произошло. Для крипты это отдельный жанр успеха.",
  ],
};

const STAT_ORDER: Array<keyof StatsDTO> = [
  "bankroll",
  "discipline",
  "fomo",
  "reputation",
  "alpha",
  "stress",
  "degen_index",
];

const STAT_COLORS: Record<keyof StatsDTO, string> = {
  bankroll: "#22c55e",
  discipline: "#3882f6",
  fomo: "#a855f7",
  reputation: "#ffd23f",
  alpha: "#ff8a1f",
  stress: "#ef4444",
  degen_index: "#00e5ff",
};

const STAT_ICONS: Record<keyof StatsDTO, (p: { size?: number }) => JSX.Element> = {
  bankroll: WalletIcon,
  discipline: BrainIcon,
  fomo: FlameIcon,
  reputation: StarIcon,
  alpha: AlphaIcon,
  stress: PulseIcon,
  degen_index: SkullIcon,
};

export interface DayRecapPageProps {
  dayNumber?: number | null;
  onContinue?: () => void;
}

export function DayRecapPage({ dayNumber: requestedDayNumber, onContinue }: DayRecapPageProps) {
  const [revealed, setRevealed] = useState(false);

  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const { data: dailyResultsData } = useQuery({ queryKey: QK.dailyResults, queryFn: getDailyResults });
  const { data: archetypesData } = useQuery({ queryKey: QK.archetypes, queryFn: () => getArchetypes("ru") });
  const { data: equippedItemsData } = useEquippedItems();
  const dayNumber = requestedDayNumber ?? gameState?.current_day?.day_number;

  const { data: dailyResult, isLoading, isError, error } = useQuery({
    queryKey: dayNumber ? QK.dailyResult(dayNumber) : ["dailyResult", "pending"],
    queryFn: () => getDailyResult(dayNumber as number),
    enabled: dayNumber != null,
    retry: false,
  });

  useEffect(() => {
    if (!dailyResult) return;
    setRevealed(false);
    const frame = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, [dailyResult?.day_number]);

  if (dayNumber == null || isLoading) {
    return <FullScreenLoading />;
  }

  if (isError || !dailyResult) {
    return (
      <ErrorState
        title="Итоги пока недоступны"
        message={friendlyErrorMessage(error, "Итоги дня ещё не готовы. Попробуй позже.")}
        action={onContinue && <button type="button" onClick={onContinue}>Вернуться к игре</button>}
      />
    );
  }

  const dailyResults = dailyResultsData?.items ?? [];
  const previousResult = dailyResults.find((item) => item.day_number === dailyResult.day_number - 1) ?? null;
  const events = (dailyResult.events_snapshot ?? null) as Record<string, EventSnapshotEntry> | null;
  const archetypeId = (gameState?.participant?.archetype_slug ?? "risk_manager") as ArchetypeId;
  const equippedItems = equippedItemsData?.items ?? [];
  const assets = getArchetypeAssetsWithSkin(archetypeId, equippedItems);
  const tone = dayTone(dailyResult.score_delta);
  const heroMood = dailyResult.score_delta > 0 ? "win" : dailyResult.score_delta < 0 ? "rekt" : "neutral";
  const aftertaste = selectAftertaste(dailyResult, tone);
  const seasonLength = gameState?.room?.season_length_days ?? 7;
  const totalBonus = totalBonusPoints(dailyResult.bonuses_applied);
  const startingStats = archetypesData?.items.find((item) => item.slug === archetypeId)?.starting_stats;
  const statDeltas = buildStatDeltas(
    dailyResult.stats_snapshot,
    previousResult?.stats_snapshot ?? (dailyResult.day_number === 1 ? startingStats : undefined)
  );
  const shareText = `Итог дня ${dailyResult.day_number} в Crypto Reality: ${formatSigned(dailyResult.score_delta)} очков`;
  const shareLink = getTelegramBotLink();
  const shareTemplate = getEquippedShareCardTemplate(equippedItems);

  const handleShareFallback = () => {
    shareUrlToTelegram(shareLink, shareText);
  };

  const handleShare = async () => {
    try {
      const result = await shareGameCard({
        kind: "day_final",
        archetypeId,
        dayNumber: dailyResult.day_number,
        seasonLength,
        score: dailyResult.score_delta,
        seasonScore: dailyResult.total_score_after,
        title: verdictTitle(dailyResult.score_delta),
        subtitle: aftertaste,
        footer: "CRYPTO REALITY · ФИНАЛ ДНЯ",
        link: shareLink,
        shareText: `Мой итог дня ${dailyResult.day_number}: ${formatSigned(dailyResult.score_delta)} DAO.`,
        templateSlug: shareTemplate?.item.slug ?? null,
        skinCutouts: getSkinCutoutOverrides(equippedItems, archetypeId),
      });
      if (result === "downloaded") {
        notifyInfo("Карточка сохранена", "Файл скачан. Его можно отправить друзьям вручную.");
      } else {
        notifySuccess("Карточка готова", "Открылось системное меню шаринга.");
      }
    } catch {
      notifyError("Не удалось создать карточку", "Отправлю обычную ссылку на итог дня.");
      handleShareFallback();
    }
  };

  return (
    <main className={`dr dr--${tone}`}>
      <header className="dr__header">
        <div className="dr__brand-row">
          <BrandHeader />
        </div>
      </header>

      <div className="dr__frame">
        <div className="dr__title-block">
          <div className="dr__title-row">
            <div className="dr__title-line" />
            <h1 className="dr__page-title">DAILY RECAP</h1>
            <div className="dr__title-line" />
          </div>
          <p className="dr__page-sub">— ИТОГ ДНЯ —</p>
          <span className="dr__recap-sub">
            <span>ДЕНЬ </span>
            <span className="dr__recap-current">{dailyResult.day_number}</span>
            <span> ИЗ {seasonLength}</span>
          </span>
          <DayProgress currentDay={dailyResult.day_number} totalDays={seasonLength} results={dailyResults} />
        </div>

        <section className="dr__hero">
          <div className="dr__hero-art" style={{ "--hero-bg": `url("${assets.background}")` } as CSSProperties}>
            <div className="dr__hero-bg" aria-hidden="true" />
            <div className="dr__hero-glow" aria-hidden="true" />
            <img className="dr__hero-character" src={assets.cutout[heroMood]} alt="" />
          </div>
          <div className="dr__score-panel">
            <div className="dr__score-box">
              <span className="dr__score-label">РЕЗУЛЬТАТ ДНЯ</span>
              <span className="dr__score-value">{formatSigned(dailyResult.score_delta)}</span>
            </div>
            <div className="dr__score-divider" />
            <div className="dr__score-box">
              <span className="dr__score-label">СЧЁТ СЕЗОНА</span>
              <span className="dr__score-value dr__score-value--season">{formatSigned(dailyResult.total_score_after)}</span>
            </div>
          </div>
        </section>

        <section className={`dr__verdict dr__verdict--${tone}`}>
          <div className="dr__verdict-icon">
            {tone === "positive" ? <TrendUpIcon size={42} /> : tone === "flat" ? <TrendFlatIcon size={42} /> : <TrendDownIcon size={42} />}
          </div>
          <div className="dr__verdict-copy">
            <h2>{verdictTitle(dailyResult.score_delta)}</h2>
            <p>{verdictText(dailyResult.score_delta)}</p>
          </div>
        </section>

        <section className="dr__compact-grid">
          <div className="dr__panel dr__panel--bonus">
            <h2 className="dr__panel-title">БОНУСЫ ДНЯ</h2>
            <div className="dr__bonus-icon"><GiftIcon size={52} /></div>
            <p className="dr__bonus-text">
              {totalBonus !== 0
                ? `${formatSigned(totalBonus)} бонусов за день`
                : "Сегодня без дополнительных бонусов"}
            </p>
            {dailyResult.bonuses_applied && dailyResult.bonuses_applied.length > 0 && (
              <div className="dr__bonus-list">
                {dailyResult.bonuses_applied.map((bonus) => (
                  <div key={bonus.slug} className="dr__bonus-row">
                    <span className="dr__bonus-row-head">
                      <span className="dr__bonus-row-title">{bonus.title}</span>
                      <span className="dr__bonus-row-points">{formatSigned(bonus.points)}</span>
                    </span>
                    <span className="dr__bonus-row-reason">{bonus.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dr__panel dr__panel--events">
            <h2 className="dr__panel-title">СОБЫТИЯ ДНЯ</h2>
            <div className="dr__events-list">
              {(EVENT_ORDER as EventType[]).map((type) => {
                const entry = events?.[type];
                return (
                  <div key={type} className={`dr__event-row dr__event-row--${entry?.status ?? "unknown"}`}>
                    <span className="dr__event-icon">{eventIcon(type)}</span>
                    <span className="dr__event-name">{EVENT_TYPE_LABELS[type]}</span>
                    <span className="dr__event-status">{eventStatusLabel(entry)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="dr__details-grid">
          <div className="dr__panel dr__panel--changes">
            <h2 className="dr__panel-title">ИЗМЕНЕНИЯ ЗА ДЕНЬ</h2>
            <div className="dr__changes-list">
              {statDeltas.slice(0, 6).map(({ key, delta, value, hasDelta }) => {
                const Icon = STAT_ICONS[key];
                const color = STAT_COLORS[key];
                return (
                  <div key={key} className="dr__change-row">
                    <span className="dr__change-icon" style={{ color }}><Icon size={15} /></span>
                    <span className="dr__change-label">{STAT_LABELS[key]}</span>
                    <span className={`dr__change-value${hasDelta ? deltaClass(delta) : ""}`}>
                      {hasDelta ? (
                        <CountUpValue target={delta} active={revealed} formatter={formatSigned} />
                      ) : (
                        <CountUpValue target={value} active={revealed} />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dr__aftertaste-card">
            <div className="dr__aftertaste-head">
              <div className="dr__aftertaste-icon"><EyeIcon size={32} /></div>
              <h2 className="dr__panel-title">ПОСЛЕВКУСИЕ ДНЯ</h2>
            </div>
            <p>{aftertaste}</p>
          </div>
        </section>

        <section className="dr__stats-panel">
          <h2 className="dr__section-title">ПОКАЗАТЕЛИ НА КОНЕЦ ДНЯ</h2>
          <div className="dr__gauge-row">
            {STAT_ORDER.map((key) => {
              const Icon = STAT_ICONS[key];
              const color = STAT_COLORS[key];
              const value = dailyResult.stats_snapshot[key];
              const pct = Math.min(100, Math.max(0, value));
              return (
                <div
                  key={key}
                  className="dr__gauge"
                  style={{ "--gauge-color": color, "--gauge-value": `${revealed ? pct : 0}%` } as CSSProperties}
                >
                  <div className="dr__gauge-ring">
                    <Icon size={20} />
                    <span className="dr__gauge-value"><CountUpValue target={value} active={revealed} /></span>
                    <span className="dr__gauge-max">/100</span>
                  </div>
                  <span className="dr__gauge-label">{STAT_LABELS[key]}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="dr__market-template-row">
          <EquippedMarketBadge
            label="Шаблон карточки"
            item={shareTemplate}
            emptyText="Classic Day Card"
          />
        </div>

        <div className="dr__cta-row">
          <button type="button" className="dr__btn-share" onClick={handleShare}>
            <ShareIcon size={18} /> ПОДЕЛИТЬСЯ
          </button>
          <button type="button" className="dr__btn-continue" onClick={onContinue}>
            <CubeIcon size={18} /> ПРОДОЛЖИТЬ
          </button>
        </div>
      </div>
    </main>
  );
}

function CountUpValue({
  target,
  active,
  durationMs = 800,
  formatter,
}: {
  target: number;
  active: boolean;
  durationMs?: number;
  formatter?: (value: number) => string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  const rounded = Number.isInteger(target) ? Math.round(display) : Math.round(display * 10) / 10;
  return <>{formatter ? formatter(rounded) : rounded}</>;
}

function DayProgress({ currentDay, totalDays, results }: { currentDay: number; totalDays: number; results: DailyResultDTO[] }) {
  return (
    <div className="dr__day-progress">
      {Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1;
        const result = results.find((item) => item.day_number === day);
        return (
          <span key={day} className={`dr__day-node${day === currentDay ? " dr__day-node--active" : ""}${result ? " dr__day-node--done" : ""}`}>
            <span>{day}</span>
          </span>
        );
      })}
    </div>
  );
}

function dayTone(delta: number): DayTone {
  if (delta > 0) return "positive";
  if (delta === 0) return "flat";
  if (delta <= -20) return "bigNegative";
  return "smallNegative";
}

function selectAftertaste(result: DailyResultDTO, tone: DayTone): string {
  const phrases = DAY_AFTERTASTE[tone];
  return phrases[stableIndex(`${result.day_number}:${result.score_delta}:${result.total_score_after}`, phrases.length)];
}

function stableIndex(seed: string, length: number): number {
  if (length <= 1) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function totalBonusPoints(bonuses: ScoreBonusDTO[] | null): number {
  return (bonuses ?? []).reduce((sum, bonus) => sum + bonus.points, 0);
}

function buildStatDeltas(current: StatsDTO, previous?: StatsDTO) {
  return STAT_ORDER.map((key) => ({
    key,
    value: current[key],
    delta: previous ? current[key] - previous[key] : 0,
    hasDelta: Boolean(previous),
  }));
}

function eventStatusLabel(entry: EventSnapshotEntry | undefined): string {
  if (!entry?.status) return "нет данных";
  if (entry.status === "completed") {
    return entry.score_delta != null
      ? `пройдено ${formatSigned(entry.score_delta)}`
      : "пройдено";
  }
  if (entry.status === "missed") return "пропущено";
  if (entry.status === "locked") return "locked";
  return entry.status;
}

function eventIcon(type: EventType): JSX.Element {
  if (type === "morning") return <SunriseIcon size={24} />;
  if (type === "day") return <SunIcon size={24} />;
  return <EveningBonusIcon size={24} />;
}

function verdictTitle(delta: number): string {
  if (delta > 0) return "ДЕНЬ ЗАКРЫТ В ПЛЮС";
  if (delta === 0) return "РЫНОК НЕ ПРОБИЛ ЗАЩИТУ";
  if (delta <= -20) return "РЫНОК УДАРИЛ БОЛЬНО";
  return "РЫНОК ТЕБЯ ПЕРЕИГРАЛ";
}

function verdictText(delta: number): string {
  if (delta > 0) return "Сегодня твои решения дали преимущество. Главное — не перепутать хороший день с бессмертием.";
  if (delta === 0) return "Хаос шумел рядом, но итог остался на месте. Иногда ноль — это тоже контроль.";
  if (delta <= -20) return "Решения дня привели к серьёзной просадке. Сезон ещё жив, но импульсивность лучше оставить за дверью.";
  return "Сегодня рынок забрал часть инициативы. Ошибка не критична, если не превращать её в реванш.";
}

function formatSigned(value: number): string {
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value > 0 ? `+${formatted}` : formatted;
}

function deltaClass(delta: number): string {
  if (delta > 0) return " dr__change-value--pos";
  if (delta < 0) return " dr__change-value--neg";
  return " dr__change-value--flat";
}

function WalletIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BrainIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4a3 3 0 0 0-3 3v1a4 4 0 0 0 0 8v1a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3ZM15 4a3 3 0 0 1 3 3v1a4 4 0 0 1 0 8v1a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 14c0-3 3-5 3-8 0 0 3 2 3 6 0 0 1.5-1 1.5-3 2 2 2 4 2 5a6 6 0 0 1-12 0c0-2 1-4 2.5-5C8.5 11 8.5 12.5 8.5 14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function AlphaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20l4-8 4 4 4-10 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PulseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 13h4l2-6 4 12 2-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkullIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.83 1.18 5.38 3.08 7.17V19a1 1 0 0 0 1 1h9.84a1 1 0 0 0 1-1v-.83C19.82 17.38 21 14.83 21 12c0-4.97-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
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

function SunriseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 16a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4v3M5.6 7.6l2 2M18.4 7.6l-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3 17 7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function EveningBonusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15.5 4.5a8 8 0 1 0 0 15c-3.4-1.2-5.6-3.8-5.6-7.5s2.2-6.3 5.6-7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 8l.7 1.5 1.6.5-1.6.5L18 12l-.7-1.5-1.6-.5 1.6-.5L18 8Z" fill="currentColor" />
    </svg>
  );
}

function GiftIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h16v8H4v-8ZM3 8h18v4H3V8ZM12 8v12M8 8c-2 0-3-1-3-2.3C5 4.8 5.7 4 6.7 4 8.5 4 10 8 10 8M16 8c2 0 3-1 3-2.3C19 4.8 18.3 4 17.3 4 15.5 4 14 8 14 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
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

function CubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3.3 7 12 12l8.7-5M12 22V12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
