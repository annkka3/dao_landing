import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { archetypeAssets, type ArchetypeId } from "../../shared/assets/archetypeAssets";
import { archetypeAccentFor } from "../../shared/assets/archetypePresentation";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getDailyResults, getGameState } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { friendlyErrorMessage } from "../../api/errorMessages";
import { notifyOnce } from "../../shared/notifications/notify";
import {
  EVENT_ORDER,
  EVENT_TYPE_LABELS,
  eventDisplayLabel,
  findEvent,
  formatDurationUntil,
  formatWindowTime,
  gameStateRefetchInterval,
  selectActiveEvent,
  selectNextWaitingWindow,
} from "../../features/game/gameState";
import type { DailyResultDTO, EventStatus, GameEventDTO, StatsDTO } from "../../api/types";
import { FullScreenLoading } from "../../shared/ui/State/FullScreenLoading";
import { ErrorState } from "../../shared/ui/State/ErrorState";
import { SparksBalanceWidget } from "../../features/market/components/SparksBalanceWidget";
import { EquippedMarketBadge } from "../../features/market/components/EquippedMarketBadge";
import { EquippedRoomThemeShell } from "../../features/market/components/EquippedRoomThemeShell";
import { getEquippedRoomTheme } from "../../features/market/equipped";
import { useEquippedItems, useSparksBalance } from "../../features/market/hooks";
import "./GameDashboardPage.css";

const WAITING_BACKGROUND_SRC = "/assets/backgrounds/room_max_9x19.webp";

const STAT_FIELDS: Array<{
  key: keyof StatsDTO;
  label: string;
  color: string;
  Icon: (p: { size?: number }) => JSX.Element;
}> = [
  { key: "bankroll",    label: "Банкролл",   color: "#22c55e", Icon: CoinIcon },
  { key: "reputation",  label: "Репутация",  color: "#3882f6", Icon: StarIcon },
  { key: "alpha",       label: "Альфа",      color: "#ffd23f", Icon: AlphaIcon },
  { key: "stress",      label: "Стресс",     color: "#ef4444", Icon: HeartIcon },
  { key: "fomo",        label: "FOMO",       color: "#ff2ed6", Icon: FlameIcon },
  { key: "discipline",  label: "Дисциплина", color: "#00e5ff", Icon: TargetIcon },
  { key: "degen_index", label: "Degen Index", color: "#a855f7", Icon: SkullIcon },
];

const DASHBOARD_AFTERTASTE_PHRASES = [
  "Главное — не путать уверенность с громкостью чата.",
  "Не каждый зелёный день делает тебя гением. Но настроение улучшает.",
  "Не каждый красный день делает тебя проигравшим. Но блокнот открыть стоит.",
  "Если решение начинается со слова «ну ладно» — это уже тревожный сигнал.",
  "Чай дешевле реванша. И полезнее для статистики.",
  "В крипте иногда выигрывает тот, кто просто не нажал лишнего.",
  "У рынка нет настроения. Это у нас оно скачет.",
  "Сначала план, потом кнопка. Не наоборот.",
  "Если хочется срочно отыграться — срочно не надо.",
  "Закрытый чат не заменяет открытую голову.",
  "Мемы лечат душу, но не всегда портфель.",
  "Дисциплина скучная, пока не спасает сезон.",
  "Хороший игрок не тот, кто всегда прав, а тот, кто быстро замечает, что неправ.",
  "FOMO громкое. Логика тихая. Слушай тихое.",
  "Если всё кажется очевидным — проверь, не ты ли уже в толпе.",
  "Иногда лучший сигнал — это желание выключить телефон.",
  "Ошибка без вывода — это просто подписка на повтор.",
  "Рынок любит спешащих. На завтрак.",
  "Внутренний деген просит кнопку. Внутренний взрослый просит паузу.",
  "Пятница любит тех, кто дожил до неё без театра.",
  "Главное — не путать уверенность с тем парнем из чата, который пишет КУПИЛ НА ВСЁ.",
  "Каждый зелёный день делает из нас Уоррена Баффета. Примерно на 17 минут.",
  "Каждый красный день превращает нас в философов. Бесплатно.",
  "Если решение начинается со слов «а что может пойти не так?» — список уже составляется.",
  "Чай дешевле мести рынку. И реже заканчивается слезами.",
  "В крипте иногда побеждает тот, кто просто убрал палец от кнопки.",
  "У рынка нет эмоций. Он арендует наши.",
  "Сначала план. Потом кнопка. Потом мем про то, как всё пошло не по плану.",
  "Если хочется срочно отыграться — рынок уже потирает руки.",
  "Закрытый чат не делает идеи умнее.",
  "Мемы лечат душу. Портфель — по настроению.",
  "Дисциплина скучная ровно до того момента, как спасает тебе сезон.",
  "Хороший игрок не всегда прав. Зато умеет быстро перестать быть неправым.",
  "FOMO орёт в мегафон. Логика пишет в личку.",
  "Если всё кажется очевидным — возможно, ты уже стоишь в очереди на ошибку.",
  "Иногда лучший сигнал — желание выключить телефон и потрогать траву.",
  "Ошибка без вывода — это автопродление подписки.",
  "Рынок любит спешащих. Особенно с кетчупом.",
  "Внутренний деген требует экшен. Внутренний взрослый требует воду и сон.",
  "Пятница любит тех, кто дошёл до неё без сюжетных поворотов.",
  "Не каждый памп — ракета. Иногда это катапульта без инструкции.",
  "Если сердце обновляется чаще графика — пора на паузу.",
  "Рынок ничего тебе не должен. Очень удобно устроился.",
  "Паника редко приносит прибыль. Зато контент получается отличный.",
  "Терпение выглядит скучно, пока внезапно не оказывается правым.",
  "Не спорь с графиком. Он отключил уведомления.",
  "Иногда лучший трейд — тот, который остался в черновиках.",
  "Если идея хорошая, она переживёт пять минут без твоего участия.",
  "Не путай движение цены с движением к успеху.",
  "Сегодняшняя уверенность — завтрашний скриншот в мем-канале.",
  "Чем громче обещания, тем интереснее потом читать мелкий шрифт.",
  "Рынок регулярно устраивает экзамен по убеждениям. Без предупреждения.",
  "Если план умер после первой свечи — это был не план, а фанфик.",
  "Не каждый шанс нужно ловить. Некоторые сами ловят тебя.",
  "Иногда сохранённые очки красивее заработанных.",
  "Эмоции — это GPS, который ведёт через болото.",
  "Красивый график не обязан заканчивать историю хеппи-эндом.",
  "Не все ракеты летят на Луну. Некоторые летят прямо в отчёт о потерях.",
  "Если хочется нажать кнопку немедленно — рынок именно этого и ждёт.",
  "Минута размышлений дешевле часа объяснений самому себе.",
  "Рынок не знает, что у тебя сегодня важный день.",
  "Удача любит подготовленных. И иногда делает вид, что это её идея.",
  "Не каждый совет из чата прошёл проверку на здравый смысл.",
  "Иногда ничего не делать — это ультраредкое легендарное действие.",
  "Чем проще объяснить решение, тем меньше шансов, что это магия.",
  "Не строй стратегию на кофеине и вайбе.",
  "Если аргумент звучит как заклинание — это не аргумент.",
  "Рынок любит сюрпризы. Особенно те, которые не нравятся.",
  "Не позволяй одной ошибке нанимать следующих.",
  "Хороший день не отменяет необходимость думать.",
  "Плохой день тоже не получил такого права.",
  "Если все уверены — пристегнись.",
  "Если никто не уверен — тоже пристегнись.",
  "Иногда лучший риск — не коллекционировать новые риски.",
  "Не оценивай решение только по финальному счёту.",
  "Иногда случайность приходит в костюме эксперта.",
  "Иногда эксперт выглядит как очень удачная случайность.",
  "Не каждый убыток означает ошибку. Иногда это просто плата за вход.",
  "Не каждая прибыль означает, что ты гений. Извини.",
  "Рынок любит смирение. Самоуверенность он коллекционирует.",
  "Если хочется доказать рынку свою правоту — рынок уже не участвует в споре.",
  "График не подписывал контракт с твоими ожиданиями.",
  "Спокойствие редко становится вирусным. Но часто выигрывает.",
  "Иногда лучший индикатор — перестать искать индикаторы.",
  "Не делай из одной свечи религию.",
  "Если стратегия работает только в идеальном мире — поздравляем с фантастикой.",
  "Не каждый шум содержит сигнал. Иногда это просто шум.",
  "Иногда сигнал маскируется под скучную разумность.",
  "Чем сильнее хочется спешить, тем полезнее притормозить.",
  "Не путай суету с прогрессом.",
  "Рынок может оставаться странным дольше, чем ты можешь оставаться упрямым.",
  "Не позволяй эго торговать с твоего аккаунта.",
  "Вовремя признать ошибку — это тоже профит.",
  "Иногда победа выглядит как отсутствие нового поражения.",
  "Не каждый день обязан войти в историю.",
  "Последовательность выигрывает чаще, чем вдохновение после трёх мотивационных видео.",
  "Если решение нельзя объяснить — оно уже выглядит подозрительно.",
  "Не строй дворец из одной удачной сделки.",
  "Не строй трагедию из одной неудачной сделки.",
  "Рынок не выдаёт медали за старание.",
  "Иногда полезно выйти из чата и проверить, существует ли солнце.",
  "Не каждый слух заслуживает твоих нейронов.",
  "Не каждый тренд заслуживает доверия.",
  "Если идея держится только на энтузиазме — фундамент уже нервничает.",
  "Хорошие привычки скучные. До первого шторма.",
  "Не позволяй страху брать управление.",
  "Не позволяй жадности сидеть рядом с рулём.",
  "Иногда они вообще работают в одной команде.",
  "Если рынок кажется слишком лёгким — ищи скрытый уровень сложности.",
  "Лучшие решения редко рождаются в режиме паники.",
  "Не каждый день приносит прибыль. Но почти каждый приносит сюжет.",
  "Ошибки оплачены. Забери хотя бы урок.",
  "Иногда рынок учит. Иногда просто троллит.",
  "Не путай уверенность с отсутствием сомнений.",
  "Сомнения полезны, если не превращаются в сериал.",
  "Хороший план переживает плохое настроение.",
  "Плохое настроение редко переживает хороший план.",
  "Главное — остаться в игре достаточно долго, чтобы перестать наступать на одни и те же грабли.",
  "Завтра рынок снова откроется. А вот твои выводы — вопрос открытый.",
  "Дисциплина редко выглядит как герой фильма. Но именно она обычно доживает до титров.",
];

export interface GameDashboardPageProps {
  onOpenEvent?: () => void;
  onSettings?: () => void;
  onStats?: () => void;
  onDaoMarket?: () => void;
  onOpenDayResult?: (dayNumber: number) => void;
  onSeasonFinished?: () => void;
}

export function GameDashboardPage({
  onOpenEvent,
  onSettings,
  onStats,
  onDaoMarket,
  onOpenDayResult,
  onSeasonFinished,
}: GameDashboardPageProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [statsFilled, setStatsFilled] = useState(false);
  const previousEveningBonusStatusRef = useRef<EventStatus | undefined>(undefined);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: QK.gameState,
    queryFn: getGameState,
    refetchInterval: (query) => gameStateRefetchInterval(query.state.data?.state),
  });

  const { data: dailyResultsData } = useQuery({
    queryKey: QK.dailyResults,
    queryFn: getDailyResults,
    enabled: data?.room != null,
    refetchInterval: (query) => (data?.state === "active" && query.state.data ? 30_000 : false),
  });
  const sparksQuery = useSparksBalance(Boolean(onDaoMarket));
  const { data: equippedItemsData } = useEquippedItems(data?.room != null);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setStatsFilled(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (data?.state !== "active" || !data.current_day || selectActiveEvent(data.events)) return;

    const eveningEndMs = new Date(data.current_day.evening_end).getTime();
    if (!Number.isNaN(eveningEndMs) && nowMs >= eveningEndMs) {
      void refetch();
    }
  }, [data, nowMs, refetch]);

  useEffect(() => {
    if (data?.state === "finished") {
      onSeasonFinished?.();
    }
  }, [data?.state, onSeasonFinished]);

  useEffect(() => {
    if (data?.state !== "active" || !data.room || !data.current_day) return;

    const eveningBonus = findEvent(data.events, "evening_bonus");
    const previousStatus = previousEveningBonusStatusRef.current;
    const currentStatus = eveningBonus?.status;
    const becameAvailable =
      previousStatus != null &&
      previousStatus !== "available" &&
      currentStatus === "available";

    if (becameAvailable) {
      const key = `crypto_reality_notified_evening_bonus_${data.room.public_id}_${data.current_day.day_number}`;
      notifyOnce(key, {
        kind: "info",
        haptic: "success",
        title: "Вечерний бонус открыт",
        message: "Ты закрыл утро и день. Можно забрать дополнительный шанс на очки.",
        ttlMs: 5_000,
      });
    }

    previousEveningBonusStatusRef.current = currentStatus;
  }, [data]);

  useEffect(() => {
    if (data?.state !== "active" || !data.room || !data.current_day) return;

    const active = selectActiveEvent(data.events);
    if (!active || (active.event_type !== "morning" && active.event_type !== "day")) return;

    const windowEndMs = new Date(active.window_end).getTime();
    if (Number.isNaN(windowEndMs)) return;

    const msLeft = windowEndMs - nowMs;
    if (msLeft <= 0 || msLeft > 30 * 60 * 1000) return;

    const key = `crypto_reality_notified_window_closing_${data.room.public_id}_${data.current_day.day_number}_${active.event_type}`;
    notifyOnce(key, {
      kind: "warning",
      title: "Окно скоро закроется",
      message: "Осталось меньше 30 минут, чтобы сделать выбор.",
      ttlMs: 5_000,
    });
  }, [data, nowMs]);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (isError) {
    return (
      <ErrorState
        message={friendlyErrorMessage(error)}
        action={
          <button type="button" onClick={() => refetch()}>
            Попробовать снова
          </button>
        }
      />
    );
  }

  if (data?.state === "finished" && onSeasonFinished) {
    return <FullScreenLoading />;
  }

  if (data?.state === "lobby") {
    return (
      <GameDashboardStatusScreen
        title="Игра ещё не началась"
        message="Комната ждёт старта сезона. Как только игра начнётся, здесь появятся день, события и показатели."
      />
    );
  }

  if (!data || data.state !== "active" || !data.room || !data.participant || !data.current_day) {
    return (
      <ErrorState
        title={data?.state === "finished" ? "Сезон завершён" : "Нет активной игры"}
        message={
          data?.state === "finished" ? "Сезон завершён. Смотри финальный результат." : "Сейчас нет активной игры."
        }
      />
    );
  }

  const { room, participant, current_day: currentDay, events } = data;
  const activeEvent = selectActiveEvent(events);
  const activeEventLabel = activeEvent ? eventDisplayLabel(activeEvent) : undefined;
  const waitingWindow = activeEvent ? undefined : selectNextWaitingWindow(events, currentDay, nowMs);
  const shouldShowWaiting = !activeEvent && (Boolean(waitingWindow) || currentDay.day_number < room.season_length_days);
  const roomWindowLabel = activeEvent
    ? activeEventLabel ?? EVENT_TYPE_LABELS[activeEvent.event_type]
    : shouldShowWaiting
      ? "Ждём событие"
      : "—";
  const roomTimerLabel = activeEvent ? "ДО КОНЦА ОКНА" : "ДО СЛЕД. СОБЫТИЯ";
  const roomTimerValue = activeEvent
    ? formatWindowTime(activeEvent.window_end)
    : waitingWindow
      ? formatDurationUntil(waitingWindow.windowStart, nowMs)
      : shouldShowWaiting
        ? "скоро"
      : "—";
  const participantArchetypeId = (participant.archetype_slug ?? "risk_manager") as ArchetypeId;
  const participantArchetypeAccent = archetypeAccentFor(participantArchetypeId);
  const dayNodes = buildDayNodes(currentDay.day_number, room.season_length_days);
  const answeredStatsEvent = selectAnsweredChoiceStatsEvent(events);
  const aftertastePhrase = selectDashboardAftertaste(
    String(room.public_id),
    currentDay.day_number,
    participant.score,
    activeEvent?.event_type ?? "waiting"
  );
  const dayResultRows = buildDashboardDayResultRows(dailyResultsData?.items ?? [], room.season_length_days);
  const roomTheme = getEquippedRoomTheme(equippedItemsData?.items ?? []);

  return (
    <main className="gd">

      {/* ── Header ── */}
      <header className="gd__header">
        <div className="gd__brand-row">
          <BrandHeader />
        </div>
        <div className="gd__title-row">
          <div className="gd__title-line" />
          <h1 className="gd__page-title">GAME DASHBOARD</h1>
          <div className="gd__title-line" />
        </div>
        <p className="gd__page-sub">— ПАНЕЛЬ ИГРЫ —</p>
      </header>

      <div className="gd__frame">

        {/* ── Room info card ── */}
        <EquippedRoomThemeShell theme={roomTheme} className="gd__market-theme-shell">
          {roomTheme && (
            <div className="gd__market-theme-badge">
              <EquippedMarketBadge label="Тема комнаты" item={roomTheme} />
            </div>
          )}
          <div className="gd__room-card">
            <div className="gd__room-col">
              <span className="gd__room-label">КОМНАТА</span>
              <div className="gd__room-name-row">
                <GroupIcon size={13} />
                <span className="gd__room-value">{room.title}</span>
              </div>
              <span className="gd__room-badge">{room.status.toUpperCase()}</span>
            </div>
            <div className="gd__room-divider" />
            <div className="gd__room-col">
              <span className="gd__room-label">ДЕНЬ</span>
              <span className="gd__room-value gd__room-day">
                {currentDay.day_number}/{room.season_length_days}
              </span>
            </div>
            <div className="gd__room-divider" />
            <div className="gd__room-col">
              <span className="gd__room-label">ОКНО</span>
              <div className="gd__room-name-row">
                <SunIcon size={13} />
                <span className="gd__room-value">
                  {roomWindowLabel}
                </span>
              </div>
            </div>
            <div className="gd__room-divider" />
            <div className="gd__room-col gd__room-col--timer">
              <span className="gd__room-label">{roomTimerLabel}</span>
              <span className="gd__room-timer">
                <TimerIcon size={12} />
                {roomTimerValue}
              </span>
            </div>
          </div>
        </EquippedRoomThemeShell>

        {/* ── Day progress ── */}
        <div className="gd__progress-card">
          <div className="gd__day-track">{dayNodes}</div>
          <div className="gd__progress-labels">
            <span>ДЕНЬ 1</span>
            <span>СЕЙЧАС: ДЕНЬ {currentDay.day_number}</span>
            <span>ФИНАЛ</span>
          </div>
        </div>

        {/* ── Current event ── */}
        <span className="gd__section-tag">ТЕКУЩЕЕ СОБЫТИЕ</span>
        <div
          className="gd__evt-card"
          style={{ "--arch-accent": participantArchetypeAccent } as CSSProperties}
        >
          {activeEvent && activeEvent.situation ? (
            <>
              <div className="gd__evt-top">
                <div className="gd__evt-portrait-outer">
                  <div className="gd__evt-portrait-inner">
                    <img
                      src={archetypeAssets[participantArchetypeId].avatar.lg}
                      alt=""
                    />
                  </div>
                </div>
                <div className="gd__evt-meta">
                  <div className="gd__evt-timer-badge">
                    <HourglassIcon size={11} /> ДО КОНЦА ОКНА {formatWindowTime(activeEvent.window_end)}
                  </div>
                  <h2 className="gd__evt-name">{activeEvent.situation.title}</h2>
                </div>
              </div>
              <p className="gd__evt-desc">{activeEvent.situation.text}</p>
              <button className="gd__goto-btn" type="button" onClick={onOpenEvent}>
                ПЕРЕЙТИ К СОБЫТИЮ <ChevronRightIcon size={16} />
              </button>
            </>
          ) : (
            <p className="gd__evt-desc">Сейчас нет доступных событий. Загляни позже.</p>
          )}
        </div>

        {answeredStatsEvent && <RoomChoiceStatsCard event={answeredStatsEvent} />}

        <SparksBalanceWidget
          balance={sparksQuery.data}
          isLoading={sparksQuery.isLoading}
          isError={sparksQuery.isError}
          compact
          onOpenMarket={onDaoMarket}
        />

        {/* ── Stats ── */}
        <div className="gd__stats-card">
          <div className="gd__stats-header">
            <span className="gd__section-title">ТВОИ ПОКАЗАТЕЛИ</span>
            <button className="gd__detail-btn" type="button" onClick={onStats}>
              ПОДРОБНЕЕ <ChevronRightIcon size={13} />
            </button>
          </div>
          <div className="gd__stats-list">
            {STAT_FIELDS.map(({ key, label, color, Icon }) => {
              const value = participant.stats[key];
              return (
                <div key={key} className="gd__stat-row">
                  <span className="gd__stat-icon" style={{ color }}>
                    <Icon size={15} />
                  </span>
                  <span className="gd__stat-label">{label}</span>
                  <div className="gd__stat-bar-wrap">
                    <div
                      className="gd__stat-bar-fill"
                      style={{
                        width: `${statsFilled ? Math.min(100, Math.max(0, value)) : 0}%`,
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      } as CSSProperties}
                    />
                    <span
                      className="gd__stat-bar-tip"
                      style={{
                        left: `${statsFilled ? Math.min(100, Math.max(0, value)) : 0}%`,
                        background: color,
                        boxShadow: `0 0 6px ${color}, 0 0 2px ${color}`,
                        opacity: statsFilled ? 1 : 0,
                      } as CSSProperties}
                    />
                  </div>
                  <span className="gd__stat-value" style={{ color }}>{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Windows of the day + Aftertaste ── */}
        <div className="gd__bottom-cols">
          <div className="gd__bottom-card">
            <span className="gd__section-title">ОКНА ДНЯ</span>
            <div className="gd__win-grid">
              {EVENT_ORDER.map((type) => {
                const ev = findEvent(events, type);
                const status: EventStatus = ev?.status ?? "locked";
                const variant = status === "available" ? "active" : status === "locked" ? "locked" : "upcoming";
                return (
                  <div key={type} className={`gd__win-card gd__win-card--${variant}`}>
                    {type === "evening_bonus" ? <MoonIcon size={15} /> : type === "morning" ? <SunriseIcon size={15} /> : <SunIcon size={15} />}
                    <span className="gd__win-label">{EVENT_TYPE_LABELS[type].toUpperCase()}</span>
                    <span className="gd__win-time">
                      {ev ? `${formatWindowTime(ev.window_start)}–${formatWindowTime(ev.window_end)}` : "—"}
                    </span>
                    {status === "locked" && <LockSmIcon size={11} />}
                    {status === "completed" && <CheckSmIcon size={11} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="gd__bottom-card gd__aftertaste-card">
            <span className="gd__section-title">ПОСЛЕВКУСИЕ</span>
            <p className="gd__aftertaste-text">{aftertastePhrase}</p>
          </div>
        </div>

        <section className="gd__day-results-section" aria-label="Результаты по дням">
          <div className="gd__day-results-title-row">
            <div className="gd__day-results-title-line" />
            <h3 className="gd__day-results-title">DAY RESULTS</h3>
            <div className="gd__day-results-title-line" />
          </div>
          <p className="gd__day-results-sub">— РЕЗУЛЬТАТЫ ПО ДНЯМ —</p>

          <div className="gd__daily-strip">
            {dayResultRows.map((row) => (
              <DashboardDayResultTile
                key={row.dayNumber}
                row={row}
                onOpen={onOpenDayResult}
              />
            ))}
          </div>
        </section>

        {onSettings && (
          <button className="gd__settings-btn" type="button" onClick={onSettings}>
            <SettingsIcon size={15} />
            НАСТРОЙКИ И ПРАВИЛА
          </button>
        )}

        <p className="gd__disclaimer">Игровой сценарий. Не финансовый совет.</p>

      </div>
    </main>
  );
}

function RoomChoiceStatsCard({ event }: { event: GameEventDTO }) {
  if (!event.situation || !event.choice_stats) return null;

  const statsByChoice = new Map(
    event.choice_stats.choices.map((choice) => [choice.choice_number, choice])
  );

  return (
    <section className="gd__choice-stats-card" aria-label="Статистика ответов комнаты">
      <div className="gd__choice-stats-head">
        <div>
          <span className="gd__section-title">КАК ОТВЕТИЛА КОМНАТА</span>
          <p className="gd__choice-stats-sub">
            {eventDisplayLabel(event)} · ответили {event.choice_stats.total_answers}
          </p>
        </div>
      </div>
      <div className="gd__choice-stats-list">
        {event.situation.choices.map((choice) => {
          const stats = statsByChoice.get(choice.choice_number);
          const percent = stats?.percent ?? 0;
          const count = stats?.count ?? 0;
          return (
            <div key={choice.id} className="gd__choice-stat-row">
              <div className="gd__choice-stat-main">
                <span className="gd__choice-stat-num">{choice.choice_number}</span>
                <span className="gd__choice-stat-text">{choice.text}</span>
              </div>
              <div className="gd__choice-stat-meter" aria-hidden="true">
                <div
                  className="gd__choice-stat-fill"
                  style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                />
              </div>
              <div className="gd__choice-stat-value">
                <strong>{percent}%</strong>
                <span>{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function selectAnsweredChoiceStatsEvent(events: GameEventDTO[]): GameEventDTO | undefined {
  const latestFirst = [...EVENT_ORDER].reverse();
  for (const type of latestFirst) {
    const event = findEvent(events, type);
    if (
      event?.status === "completed" &&
      event.situation &&
      event.choice_stats &&
      event.choice_stats.total_answers > 0
    ) {
      return event;
    }
  }
  return undefined;
}

type DashboardDayResultRow = {
  dayNumber: number;
  result: DailyResultDTO | null;
};

function buildDashboardDayResultRows(results: DailyResultDTO[], totalDays: number): DashboardDayResultRow[] {
  const byDay = new Map(results.map((item) => [item.day_number, item]));
  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1;
    return {
      dayNumber,
      result: byDay.get(dayNumber) ?? null,
    };
  });
}

function DashboardDayResultTile({
  row,
  onOpen,
}: {
  row: DashboardDayResultRow;
  onOpen?: (dayNumber: number) => void;
}) {
  const { dayNumber, result } = row;
  const isLocked = result == null;
  const tone = result ? dashboardDailyDeltaTone(result.score_delta) : "locked";
  const color = dashboardDailyDeltaColor(tone);
  const Icon = isLocked ? LockSmIcon : tone === "pos" ? TrendUpIcon : tone === "neg" ? TrendDownIcon : TrendFlatIcon;

  return (
    <button
      type="button"
      className={`gd__daily-tile gd__daily-tile--${tone}`}
      style={{ "--day-tone": color } as CSSProperties}
      disabled={isLocked}
      onClick={() => {
        if (!isLocked) onOpen?.(dayNumber);
      }}
    >
      <span className="gd__daily-icon">
        <Icon size={17} />
      </span>
      <span className="gd__daily-day">День {dayNumber}</span>
      <span className="gd__daily-summary">{result ? dashboardDailyDeltaSummary(result.score_delta) : "Закрыто"}</span>
      <span className="gd__daily-score">{result ? formatSignedDashboardScore(result.score_delta) : "—"}</span>
    </button>
  );
}

type DashboardDailyDeltaTone = "pos" | "neg" | "flat" | "locked";

function dashboardDailyDeltaTone(delta: number): DashboardDailyDeltaTone {
  if (delta > 0) return "pos";
  if (delta < 0) return "neg";
  return "flat";
}

function dashboardDailyDeltaColor(tone: DashboardDailyDeltaTone): string {
  if (tone === "pos") return "#7cff2e";
  if (tone === "neg") return "#ff3b30";
  if (tone === "flat") return "#ffd23f";
  return "#6f7788";
}

function dashboardDailyDeltaSummary(delta: number): string {
  if (delta >= 70) return "Мощное завершение";
  if (delta >= 40) return "Удачная серия";
  if (delta >= 20) return "Хороший разгон";
  if (delta >= 1) return "Осторожный старт";
  if (delta === 0) return "День без движения";
  if (delta >= -19) return "Неправильный вход";
  if (delta >= -39) return "Ошибки в рынке";
  if (delta >= -59) return "Жёсткая просадка";
  return "Критический провал";
}

function formatSignedDashboardScore(value: number): string {
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value > 0 ? `+${formatted}` : formatted;
}

/* ── Day progress builder ── */
function buildDayNodes(currentDay: number, totalDays: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const done = d < currentDay;
    const active = d === currentDay;
    const final = d === totalDays;
    if (d > 1) {
      nodes.push(
        <div key={`c${d}`} className={`gd__day-conn${d <= currentDay ? " gd__day-conn--done" : ""}`} />
      );
    }
    nodes.push(
      <div
        key={`n${d}`}
        className={[
          "gd__day-node",
          done && "gd__day-node--done",
          active && "gd__day-node--active",
          final && "gd__day-node--final",
        ].filter(Boolean).join(" ")}
      >
        {done ? <CheckSmIcon size={10} />
          : final ? <StarSmIcon size={10} />
            : <span className="gd__day-num">{d}</span>}
      </div>
    );
  }
  return nodes;
}

function selectDashboardAftertaste(
  roomId: string,
  dayNumber: number,
  score: number,
  eventType: string
): string {
  const seed = `${roomId}|${dayNumber}|${Math.round(score)}|${eventType}`;
  return DASHBOARD_AFTERTASTE_PHRASES[stablePhraseIndex(seed, DASHBOARD_AFTERTASTE_PHRASES.length)];
}

function stablePhraseIndex(seed: string, length: number): number {
  if (length <= 1) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function GameDashboardStatusScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="gd gd--waiting">
      <header className="gd__header">
        <div className="gd__brand-row">
          <BrandHeader />
        </div>
        <div className="gd__title-row">
          <div className="gd__title-line" />
          <h1 className="gd__page-title">GAME DASHBOARD</h1>
          <div className="gd__title-line" />
        </div>
        <p className="gd__page-sub">— ПАНЕЛЬ ИГРЫ —</p>
      </header>

      <div className="gd__frame">
        <section
          className="gd__waiting-card"
          style={{ "--waiting-bg": `url("${WAITING_BACKGROUND_SRC}")` } as CSSProperties}
        >
          <div className="gd__waiting-bg" aria-hidden="true" />
          <div className="gd__waiting-icon">
            <DashboardClockIcon size={34} />
          </div>
          <h2 className="gd__waiting-title">{title}</h2>
          <p className="gd__waiting-desc">{message}</p>
        </section>
      </div>
    </main>
  );
}

/* ── Icons ── */

function GroupIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 11a3 3 0 1 0 0-6M21 20v-1a6 6 0 0 0-4-5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.41 1.41M18.36 18.36l1.41 1.41M2 12h2M20 12h2M4.22 19.78l1.41-1.41M18.36 5.64l1.41-1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SunriseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 18a5 5 0 0 0-10 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 10V6M6.5 9.5L5 8M17.5 9.5L19 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function TimerIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 2h6M12 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HourglassIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3h14M5 21h14M7 3v4l4 4.5L7 16v5M17 3v4l-4 4.5L17 16v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardClockIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path className="gd__clock-hand gd__clock-hand--hour" d="M12 12V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path className="gd__clock-hand gd__clock-hand--minute" d="M12 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3.5V2M12 22v-1.5M20.5 12H22M2 12h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.58" />
    </svg>
  );
}

function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.04.04a2.05 2.05 0 0 1-2.9 2.9l-.04-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .58V20a2 2 0 0 1-4 0v-.02a1.7 1.7 0 0 0-1-.58 1.7 1.7 0 0 0-1.87.34l-.04.04a2.05 2.05 0 0 1-2.9-2.9l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.58-1H4a2 2 0 0 1 0-4h.02a1.7 1.7 0 0 0 .58-1 1.7 1.7 0 0 0-.34-1.87l-.04-.04a2.05 2.05 0 0 1 2.9-2.9l.04.04A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.58V4a2 2 0 0 1 4 0v.02a1.7 1.7 0 0 0 1 .58 1.7 1.7 0 0 0 1.87-.34l.04-.04a2.05 2.05 0 0 1 2.9 2.9l-.04.04A1.7 1.7 0 0 0 19.4 9c.22.36.53.65.9.83H20a2 2 0 0 1 0 4h-.02c-.37.18-.68.47-.58 1.17z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlphaIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 20l4-8 4 4 4-10 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CoinIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v2m0 6v2m-1.5-8h2.5a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

function HeartIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 14c0-3 3-5 3-8 0 0 3 2 3 6 0 0 1.5-1 1.5-3 2 2 2 4 2 5a6 6 0 0 1-12 0c0-2 1-4 2.5-5C8.5 11 8.5 12.5 8.5 14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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

function SkullIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3C7.03 3 3 7.03 3 12c0 2.83 1.18 5.38 3.08 7.17V19a1 1 0 0 0 1 1h9.84a1 1 0 0 0 1-1v-.83C19.82 17.38 21 14.83 21 12c0-4.97-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 17v1M12 17v1M15 17v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CheckSmIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarSmIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LockSmIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrendUpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l5-5 4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8l5 5 4-4 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 17h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendFlatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
