import { useAppContext, type FlowStep } from "./store/AppContext";
import { BottomNav, type NavTab } from "./shared/components/BottomNav/BottomNav";
import { FullScreenLoading } from "./shared/ui/State/FullScreenLoading";
import { ErrorState } from "./shared/ui/State/ErrorState";
import { Button } from "./shared/ui/Button/Button";

import { ArchetypeSelectionPage } from "./pages/ArchetypeSelectionPage/ArchetypeSelectionPage";
import { AchievementsPage } from "./pages/AchievementsPage/AchievementsPage";
import { ChoiceResultPage } from "./pages/ChoiceResultPage/ChoiceResultPage";
import { CurrentEventPage } from "./pages/CurrentEventPage/CurrentEventPage";
import { DayRecapPage } from "./pages/DayRecapPage/DayRecapPage";
import { FinalCollectionPage } from "./pages/FinalCollectionPage/FinalCollectionPage";
import { FinalResultPage } from "./pages/FinalResultPage/FinalResultPage";
import { GameDashboardPage } from "./pages/GameDashboardPage/GameDashboardPage";
import { DaoMarketPage } from "./features/market/pages/DaoMarketPage";
import { InventoryPage } from "./features/market/pages/InventoryPage";
import { SecurityOpsPage } from "./features/security/pages/SecurityOpsPage";
import { AddTradePage } from "./features/journal/pages/AddTradePage/AddTradePage";
import { AnalyticsPage } from "./features/journal/pages/AnalyticsPage/AnalyticsPage";
import { ChecklistPage } from "./features/journal/pages/ChecklistPage/ChecklistPage";
import { JournalOverviewPage } from "./features/journal/pages/JournalOverviewPage/JournalOverviewPage";
import { RewardResultPage } from "./features/journal/pages/RewardResultPage/RewardResultPage";
import { RiskProfilePage } from "./features/journal/pages/RiskProfilePage/RiskProfilePage";
import { SkipTradePage } from "./features/journal/pages/SkipTradePage/SkipTradePage";
import { TradeDetailPage } from "./features/journal/pages/TradeDetailPage/TradeDetailPage";
import { TradeJournalPage } from "./features/journal/pages/TradeJournalPage/TradeJournalPage";
import { InviteRoomPage } from "./pages/InviteRoomPage/InviteRoomPage";
import { LeaderboardPage } from "./pages/LeaderboardPage/LeaderboardPage";
import { LobbyPage } from "./pages/LobbyPage/LobbyPage";
import { ProfilePage } from "./pages/ProfilePage/ProfilePage";
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage/ProfileSettingsPage";
import { RoomEntryPage } from "./pages/RoomEntryPage/RoomEntryPage";
import { StatsPage } from "./pages/StatsPage/StatsPage";
import { WelcomeScreen } from "./pages/WelcomePage/WelcomeScreen";
import { getTelegramBotLink, openTelegramLink } from "./telegram/webapp";

// ─── Nav tab mapping ──────────────────────────────────────────────────────────

const TAB_MAP: Partial<Record<FlowStep, NavTab>> = {
  home: "lobby",
  lobby: "lobby",
  room: "lobby",
  invite: "lobby",
  dashboard: "play",
  stats: "play",
  event: "events",
  result: "play",
  recap: "play",
  leaderboard: "market",
  final: "play",
  profile: "profile",
  settings: "profile",
  achievements: "profile",
  finalCollection: "profile",
  dao_market: "market",
  inventory: "market",
};

const NO_NAV: FlowStep[] = ["bootstrap", "welcome", "archetype"];
const HIDDEN_NO_NAV: FlowStep[] = [
  "security",
  "journal",
  "journal_add",
  "journal_checklist",
  "journal_skip",
  "journal_reward",
  "journal_trades",
  "journal_trade_detail",
  "journal_analytics",
  "journal_profile",
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { state, navigate, openRecap, setUser, setCurrentRoom, setLastChoiceResult, openJournalTrade, setJournalReward } =
    useAppContext();
  const {
    step,
    bootstrapStatus,
    user,
    currentRoom,
    lastChoiceResult,
    targetRecapDayNumber,
    selectedJournalTradeId,
    lastJournalReward,
  } = state;

  const go = (s: FlowStep) => () => navigate(s);
  const showNav = !NO_NAV.includes(step) && !HIDDEN_NO_NAV.includes(step);

  function roomDestination(room: { status: string }, participant: { archetype_slug: string | null }): FlowStep {
    if (room.status === "active") return participant.archetype_slug ? "dashboard" : "archetype";
    if (room.status === "finished") return "final";
    return "lobby";
  }

  function playDestination(): FlowStep {
    return currentRoom?.status === "finished" ? "final" : "dashboard";
  }

  function lobbyDestination(): FlowStep {
    return currentRoom && currentRoom.status !== "cancelled" ? "lobby" : "room";
  }

  // ── Bootstrap states ──────────────────────────────────────────────────────

  if (bootstrapStatus === "loading") {
    return <FullScreenLoading />;
  }

  if (bootstrapStatus === "error") {
    return (
      <ErrorState
        message="Не удалось загрузить игру. Проверь соединение."
        action={<Button onClick={() => window.location.reload()}>Попробовать снова</Button>}
      />
    );
  }

  if (bootstrapStatus === "no_auth") {
    const botLink = getTelegramBotLink();
    return (
      <ErrorState
        title="Открой игру через Telegram"
        message="Crypto Reality работает как Telegram Mini App. Перейди в бот и нажми «Открыть Crypto Reality»."
        action={<Button onClick={() => openTelegramLink(botLink)}>Открыть бота</Button>}
      />
    );
  }

  // ── Pages ─────────────────────────────────────────────────────────────────

  function renderPage() {
    if (step === "welcome") {
      return (
        <WelcomeScreen
          onStart={go("room")}
          onDisclaimerAccepted={(updatedUser) => {
            setUser(updatedUser);
            navigate("room");
          }}
          user={user}
        />
      );
    }

    if (step === "home") {
      return (
        <RoomEntryPage
          onCreateRoom={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate(roomDestination(room, participant));
          }}
          onJoinRoom={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate(roomDestination(room, participant));
          }}
        />
      );
    }

    if (step === "room") {
      return (
        <RoomEntryPage
          onCreateRoom={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate(roomDestination(room, participant));
          }}
          onJoinRoom={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate(roomDestination(room, participant));
          }}
          onBack={currentRoom ? go("lobby") : undefined}
        />
      );
    }

    if (step === "invite") {
      return (
        <InviteRoomPage
          room={currentRoom}
          onBack={go("lobby")}
        />
      );
    }

    if (step === "lobby") {
      return (
        <LobbyPage
          onChooseArchetype={go("archetype")}
          onStartGame={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate("lobby");
          }}
          onInvite={go("invite")}
          onFinal={go("final")}
          onCancelled={go("room")}
          onNoRoom={go("room")}
          onOpenEvent={go("event")}
        />
      );
    }

    if (step === "archetype") {
      return (
        <ArchetypeSelectionPage
          onConfirm={(room, participant) => {
            setCurrentRoom(room, participant);
            navigate(roomDestination(room, participant));
          }}
          onBack={go("lobby")}
        />
      );
    }

    if (step === "dashboard") {
      return (
        <GameDashboardPage
          onOpenEvent={go("event")}
          onSettings={go("settings")}
          onStats={go("stats")}
          onDaoMarket={go("dao_market")}
          onOpenDayResult={(dayNumber) => openRecap(dayNumber)}
          onSeasonFinished={go("final")}
        />
      );
    }

    if (step === "stats") {
      return <StatsPage onBack={go("dashboard")} />;
    }

    if (step === "event") {
      return (
        <CurrentEventPage
          onResult={(result) => {
            setLastChoiceResult(result);
            navigate("result");
          }}
          onProfile={go("profile")}
          onSettings={go("settings")}
          onBack={go("dashboard")}
        />
      );
    }

    if (step === "result") {
      return (
        <ChoiceResultPage
          result={lastChoiceResult}
          onContinue={go("event")}
          onDayReview={() => openRecap()}
        />
      );
    }

    if (step === "recap") {
      return <DayRecapPage dayNumber={targetRecapDayNumber} onContinue={go("dashboard")} />;
    }

    if (step === "leaderboard") {
      return (
        <LeaderboardPage
          onBack={go("room")}
          onFinal={go("final")}
          onOpenDayResult={(dayNumber) => openRecap(dayNumber)}
        />
      );
    }

    if (step === "profile") {
      return (
        <ProfilePage
          onSettings={go("settings")}
          onAchievements={go("achievements")}
          onFinalCollection={go("finalCollection")}
          onDaoMarket={go("dao_market")}
          onInventory={go("inventory")}
          onStats={go("stats")}
          onRiskGuardian={go("journal")}
        />
      );
    }

    if (step === "achievements") {
      return <AchievementsPage onBack={go("profile")} />;
    }

    if (step === "finalCollection") {
      return <FinalCollectionPage onBack={go("profile")} />;
    }

    if (step === "dao_market") {
      return <DaoMarketPage onBack={go("profile")} onInventory={go("inventory")} />;
    }

    if (step === "inventory") {
      return <InventoryPage onBack={go("dao_market")} onMarket={go("dao_market")} />;
    }

    if (step === "settings") {
      return (
        <ProfileSettingsPage
          onBack={go("profile")}
          onReturnToGame={go("dashboard")}
          onLeftGame={() => {
            setCurrentRoom(null, null);
            navigate("room");
          }}
        />
      );
    }

    if (step === "security") {
      return <SecurityOpsPage onBack={go("profile")} />;
    }

    if (step === "journal") {
      return (
        <JournalOverviewPage
          onAddTrade={go("journal_add")}
          onAnalytics={go("journal_analytics")}
          onJournal={go("journal_trades")}
          onProfile={go("journal_profile")}
          onTrade={(tradeId) => openJournalTrade("journal_trade_detail", tradeId)}
        />
      );
    }

    if (step === "journal_add") {
      return (
        <AddTradePage
          onBack={go("journal")}
          onChecklist={(tradeId) => openJournalTrade("journal_checklist", tradeId)}
        />
      );
    }

    if (step === "journal_checklist") {
      return (
        <ChecklistPage
          tradeId={selectedJournalTradeId}
          onBack={go("journal")}
          onReward={(response) => setJournalReward(response.reward)}
          onSkip={go("journal_skip")}
        />
      );
    }

    if (step === "journal_skip") {
      return (
        <SkipTradePage
          tradeId={selectedJournalTradeId}
          onBack={go("journal")}
          onReward={(response) => setJournalReward(response.reward)}
        />
      );
    }

    if (step === "journal_reward") {
      return (
        <RewardResultPage
          reward={lastJournalReward}
          onBack={go("journal")}
          onOverview={go("journal")}
        />
      );
    }

    if (step === "journal_trades") {
      return (
        <TradeJournalPage
          onBack={go("journal")}
          onAddTrade={go("journal_add")}
          onOpenTrade={(tradeId) => openJournalTrade("journal_trade_detail", tradeId)}
        />
      );
    }

    if (step === "journal_trade_detail") {
      return <TradeDetailPage tradeId={selectedJournalTradeId} onBack={go("journal")} />;
    }

    if (step === "journal_analytics") {
      return <AnalyticsPage onBack={go("journal")} />;
    }

    if (step === "journal_profile") {
      return <RiskProfilePage onBack={go("journal")} onSaved={go("journal")} />;
    }

    if (step === "final") {
      return (
        <FinalResultPage
          onPlayAgain={go("lobby")}
          onOpenDayResult={(dayNumber) => openRecap(dayNumber)}
        />
      );
    }

    return null;
  }

  return (
    <>
      {renderPage()}
      {showNav && (
        <BottomNav
          active={TAB_MAP[step] ?? "lobby"}
          onLobby={() => navigate(lobbyDestination())}
          onEvents={go("event")}
          onPlay={() => navigate(playDestination())}
          onMarket={go("dao_market")}
          onProfile={go("profile")}
        />
      )}
    </>
  );
}
