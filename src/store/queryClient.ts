import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on auth/domain errors — they need user action, not retries.
      retry: (failureCount, error) => {
        if (ApiError.isApiError(error) && error.status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// ─── Query key factory ────────────────────────────────────────────────────────

export const QK = {
  me: ["me"] as const,
  currentRoom: ["currentRoom"] as const,
  gameState: ["gameState"] as const,
  leaderboard: (publicId: string) => ["leaderboard", publicId] as const,
  roomParticipants: (publicId: string) => ["roomParticipants", publicId] as const,
  roomEventFeed: (publicId: string) => ["roomEventFeed", publicId] as const,
  dailyResults: ["dailyResults"] as const,
  dailyResult: (day: number) => ["dailyResult", day] as const,
  finalResult: ["finalResult"] as const,
  finalCollection: ["finalCollection"] as const,
  profileSummary: ["profileSummary"] as const,
  achievements: ["achievements"] as const,
  archetypes: ["archetypes"] as const,
} as const;
