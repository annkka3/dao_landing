import { useQuery } from "@tanstack/react-query";
import { CurrentGameCard } from "../../features/game/components/CurrentGameCard/CurrentGameCard";
import { BrandHeader } from "../../shared/components/BrandHeader/BrandHeader";
import { getGameState } from "../../api/endpoints";
import { QK } from "../../store/queryClient";
import { EVENT_TYPE_LABELS, selectActiveEvent } from "../../features/game/gameState";
import type { ArchetypeId } from "../../shared/assets/archetypeAssets";
import type { GameEventDTO } from "../../api/types";
import "../screen.css";
import "./HomePage.css";
import { QuickActions } from "./QuickActions";

export interface HomePageProps {
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
  onContinue?: () => void;
  onResults?: () => void;
}

function activeEventLabel(events: GameEventDTO[] | undefined): string {
  const event = selectActiveEvent(events);
  if (!event) return "Нет доступных событий сейчас";
  return event.situation ? `${EVENT_TYPE_LABELS[event.event_type]}: ${event.situation.title}` : EVENT_TYPE_LABELS[event.event_type];
}

export function HomePage({ onCreateRoom, onJoinRoom, onContinue, onResults }: HomePageProps) {
  const { data: gameState } = useQuery({ queryKey: QK.gameState, queryFn: getGameState });
  const { room, participant, current_day: currentDay, events } = gameState ?? {};
  const isActive = gameState?.state === "active" && room && participant && currentDay;

  return (
    <main className="screen">
      <div className="screen__frame">
        <header className="screen__header">
          <BrandHeader />
          {isActive && (
            <p className="screen__subtitle">
              {room.title} · День {currentDay.day_number} / {room.season_length_days}
            </p>
          )}
        </header>

        <div className="home__title-row">
          <div className="home__title-line" />
          <h1 className="home__page-title">HOME</h1>
          <div className="home__title-line" />
        </div>
        <p className="home__page-sub">— ГЛАВНАЯ —</p>

        {isActive && (
          <CurrentGameCard
            archetypeId={(participant.archetype_slug ?? "risk_manager") as ArchetypeId}
            dayLabel={`День ${currentDay.day_number} из ${room.season_length_days}`}
            nextEvent={activeEventLabel(events)}
            onContinue={onContinue}
            roomName={room.title}
            stats={[
              { label: "Банкролл", value: participant.stats.bankroll, tone: "bankroll" },
              { label: "Стресс", value: participant.stats.stress, tone: "stress" },
              { label: "FOMO", value: participant.stats.fomo, tone: "fomo" },
              { label: "Дисциплина", value: participant.stats.discipline, tone: "discipline" },
            ]}
          />
        )}

        <section className="screen__section">
          <h2 className="screen__title">Быстрые действия</h2>
          <QuickActions onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} onResults={onResults} />
        </section>
      </div>
    </main>
  );
}
