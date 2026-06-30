import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { postAuthTelegram, getCurrentRoom } from "../api/endpoints";
import { ApiError } from "../api/errors";
import type {
  ParticipantDTO,
  RoomDTO,
  SubmitChoiceResponse,
  UserMeResponse,
} from "../api/types";
import type { RewardInfo as JournalRewardInfo } from "../features/journal/types";
import {
  getMiniAppLaunchDayNumber,
  getMiniAppLaunchView,
  getTelegramStartParam,
  getTelegramInitData,
} from "../telegram/webapp";

// ─── Flow steps ───────────────────────────────────────────────────────────────

export type FlowStep =
  | "bootstrap"
  | "welcome"
  | "home"
  | "room"
  | "invite"
  | "lobby"
  | "archetype"
  | "dashboard"
  | "stats"
  | "event"
  | "result"
  | "recap"
  | "leaderboard"
  | "profile"
  | "achievements"
  | "finalCollection"
  | "dao_market"
  | "inventory"
  | "settings"
  | "security"
  | "journal"
  | "journal_add"
  | "journal_checklist"
  | "journal_skip"
  | "journal_reward"
  | "journal_trades"
  | "journal_trade_detail"
  | "journal_analytics"
  | "journal_profile"
  | "final";

// ─── State ────────────────────────────────────────────────────────────────────

type BootstrapStatus = "loading" | "ready" | "error" | "no_auth";

interface AppState {
  bootstrapStatus: BootstrapStatus;
  user: UserMeResponse | null;
  currentRoom: RoomDTO | null;
  currentParticipant: ParticipantDTO | null;
  step: FlowStep;
  lastChoiceResult: SubmitChoiceResponse | null;
  targetRecapDayNumber: number | null;
  selectedJournalTradeId: string | null;
  lastJournalReward: JournalRewardInfo | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type AppAction =
  | {
      type: "BOOTSTRAP_DONE";
      user: UserMeResponse;
      room: RoomDTO | null;
      participant: ParticipantDTO | null;
      step: FlowStep;
      targetRecapDayNumber?: number | null;
    }
  | { type: "BOOTSTRAP_ERROR" }
  | { type: "BOOTSTRAP_NO_AUTH" }
  | { type: "SET_USER"; user: UserMeResponse }
  | {
      type: "SET_CURRENT_ROOM";
      room: RoomDTO | null;
      participant: ParticipantDTO | null;
    }
  | { type: "NAVIGATE"; step: FlowStep }
  | { type: "OPEN_JOURNAL_TRADE"; step: FlowStep; tradeId: string | null }
  | { type: "SET_JOURNAL_REWARD"; reward: JournalRewardInfo | null }
  | { type: "OPEN_RECAP"; dayNumber: number | null }
  | { type: "SET_LAST_CHOICE_RESULT"; result: SubmitChoiceResponse | null };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "BOOTSTRAP_DONE":
      return {
        ...state,
        bootstrapStatus: "ready",
        user: action.user,
        currentRoom: action.room,
        currentParticipant: action.participant,
        step: action.step,
        targetRecapDayNumber: action.targetRecapDayNumber ?? null,
      };
    case "BOOTSTRAP_ERROR":
      return { ...state, bootstrapStatus: "error" };
    case "BOOTSTRAP_NO_AUTH":
      return { ...state, bootstrapStatus: "no_auth", step: "welcome" };
    case "SET_USER":
      return { ...state, user: action.user };
    case "SET_CURRENT_ROOM":
      return {
        ...state,
        currentRoom: action.room,
        currentParticipant: action.participant,
      };
    case "NAVIGATE":
      return {
        ...state,
        step: action.step,
        targetRecapDayNumber: action.step === "recap" ? state.targetRecapDayNumber : null,
      };
    case "OPEN_JOURNAL_TRADE":
      return { ...state, step: action.step, selectedJournalTradeId: action.tradeId };
    case "SET_JOURNAL_REWARD":
      return { ...state, step: "journal_reward", lastJournalReward: action.reward };
    case "OPEN_RECAP":
      return { ...state, step: "recap", targetRecapDayNumber: action.dayNumber };
    case "SET_LAST_CHOICE_RESULT":
      return { ...state, lastChoiceResult: action.result };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  navigate: (step: FlowStep) => void;
  openRecap: (dayNumber?: number | null) => void;
  setUser: (user: UserMeResponse) => void;
  setCurrentRoom: (room: RoomDTO | null, participant: ParticipantDTO | null) => void;
  setLastChoiceResult: (result: SubmitChoiceResponse | null) => void;
  openJournalTrade: (step: FlowStep, tradeId: string | null) => void;
  setJournalReward: (reward: JournalRewardInfo | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Bootstrap logic ─────────────────────────────────────────────────────────

function resolveInitialStep(
  user: UserMeResponse,
  room: RoomDTO | null,
  participant: ParticipantDTO | null
): FlowStep {
  if (!user.disclaimer_is_accepted) return "welcome";
  if (getTelegramStartParam().trim().length >= 4) return "room";
  if (!room) return "room";

  switch (room.status) {
    case "lobby":
      return participant?.archetype_slug ? "lobby" : "archetype";
    case "active":
      // A late-joiner who refreshed before finishing their one-time archetype
      // pick (see select_archetype's late-joiner branch) lands back on
      // ArchetypeSelectionPage instead of a dashboard with nothing to show.
      return participant?.archetype_slug ? "dashboard" : "archetype";
    case "finished":
      return "final";
    default:
      return "room";
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    bootstrapStatus: "loading",
    user: null,
    currentRoom: null,
    currentParticipant: null,
    step: "bootstrap",
    lastChoiceResult: null,
    targetRecapDayNumber: null,
    selectedJournalTradeId: null,
    lastJournalReward: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // In Telegram WebApp, initData is always present. Without it (local dev
      // without Telegram, unless VITE_DEV_TMA_INIT_DATA is set), we degrade gracefully.
      if (!getTelegramInitData()) {
        if (!cancelled) dispatch({ type: "BOOTSTRAP_NO_AUTH" });
        return;
      }

      try {
        const user = await postAuthTelegram();
        const { room, participant } = await getCurrentRoom();

        if (cancelled) return;

        const step = resolveInitialStep(user, room, participant);
        const launchView = getMiniAppLaunchView();
        const launchDayNumber = getMiniAppLaunchDayNumber();
        const launchStep =
          launchView === "security" ? "security"
            : step === "welcome" ? step
              : launchView === "journal" ? "journal"
                : launchView === "market" ? "dao_market"
                  : launchView === "day_recap" && room ? "recap"
                    : launchView === "final" && room ? "final"
                      : step;
        dispatch({
          type: "BOOTSTRAP_DONE",
          user,
          room,
          participant,
          step: launchStep,
          targetRecapDayNumber: launchView === "day_recap" ? launchDayNumber : null,
        });
      } catch (err) {
        if (cancelled) return;
        if (ApiError.isApiError(err) && err.status === 401) {
          dispatch({ type: "BOOTSTRAP_NO_AUTH" });
        } else {
          dispatch({ type: "BOOTSTRAP_ERROR" });
        }
      }
    }

    void bootstrap();
    return () => { cancelled = true; };
  }, []);

  const navigate = (step: FlowStep) => dispatch({ type: "NAVIGATE", step });
  const openRecap = (dayNumber?: number | null) =>
    dispatch({ type: "OPEN_RECAP", dayNumber: dayNumber ?? null });
  const setUser = (user: UserMeResponse) => dispatch({ type: "SET_USER", user });
  const setCurrentRoom = (room: RoomDTO | null, participant: ParticipantDTO | null) =>
    dispatch({ type: "SET_CURRENT_ROOM", room, participant });
  const setLastChoiceResult = (result: SubmitChoiceResponse | null) =>
    dispatch({ type: "SET_LAST_CHOICE_RESULT", result });
  const openJournalTrade = (step: FlowStep, tradeId: string | null) =>
    dispatch({ type: "OPEN_JOURNAL_TRADE", step, tradeId });
  const setJournalReward = (reward: JournalRewardInfo | null) =>
    dispatch({ type: "SET_JOURNAL_REWARD", reward });

  return (
    <AppContext.Provider
      value={{
        state,
        navigate,
        openRecap,
        setUser,
        setCurrentRoom,
        setLastChoiceResult,
        openJournalTrade,
        setJournalReward,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
