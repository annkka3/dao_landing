import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeChecklist,
  createTrade,
  getJournalAnalytics,
  getJournalOverview,
  getJournalProfile,
  getJournalTradeDetail,
  getJournalTrades,
  riskCheckTrade,
  saveJournalProfile,
  skipTrade,
} from "./api";
import type {
  AnalyticsPeriod,
  ChecklistRequest,
  JournalProfileRequest,
  RiskCheckRequest,
  SkipTradeRequest,
  TradeCreateRequest,
  TradeStatus,
} from "./types";

export const JQK = {
  profile: ["journal", "profile"] as const,
  overview: ["journal", "overview"] as const,
  analytics: (period: AnalyticsPeriod) => ["journal", "analytics", period] as const,
  trades: (status?: TradeStatus, limit = 20, offset = 0) =>
    ["journal", "trades", status ?? "all", limit, offset] as const,
  tradeDetail: (tradeId: string | null | undefined) =>
    ["journal", "trades", "detail", tradeId ?? "none"] as const,
};

export function useJournalProfile() {
  return useQuery({ queryKey: JQK.profile, queryFn: getJournalProfile });
}

export function useSaveJournalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: JournalProfileRequest) => saveJournalProfile(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JQK.profile });
      void queryClient.invalidateQueries({ queryKey: JQK.overview });
    },
  });
}

export function useJournalOverview() {
  return useQuery({ queryKey: JQK.overview, queryFn: getJournalOverview });
}

export function useJournalAnalytics(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: JQK.analytics(period),
    queryFn: () => getJournalAnalytics(period),
    enabled,
  });
}

export function useJournalTrades(params: {
  status?: TradeStatus;
  limit?: number;
  offset?: number;
} = {}) {
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  return useQuery({
    queryKey: JQK.trades(params.status, limit, offset),
    queryFn: () => getJournalTrades({ status: params.status, limit, offset }),
  });
}

export function useJournalTradeDetail(tradeId: string | null | undefined) {
  return useQuery({
    queryKey: JQK.tradeDetail(tradeId),
    queryFn: () => getJournalTradeDetail(tradeId as string),
    enabled: Boolean(tradeId),
  });
}

export function useRiskCheck() {
  return useMutation({ mutationFn: (body: RiskCheckRequest) => riskCheckTrade(body) });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: TradeCreateRequest) => createTrade(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: JQK.overview });
      void queryClient.invalidateQueries({ queryKey: ["journal", "trades"] });
    },
  });
}

export function useCompleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, payload }: { tradeId: string; payload: ChecklistRequest }) =>
      completeChecklist(tradeId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: JQK.overview });
      void queryClient.invalidateQueries({ queryKey: ["journal", "trades"] });
      void queryClient.invalidateQueries({ queryKey: JQK.tradeDetail(variables.tradeId) });
    },
  });
}

export function useSkipTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, payload }: { tradeId: string; payload: SkipTradeRequest }) =>
      skipTrade(tradeId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: JQK.overview });
      void queryClient.invalidateQueries({ queryKey: ["journal", "trades"] });
      void queryClient.invalidateQueries({ queryKey: JQK.tradeDetail(variables.tradeId) });
    },
  });
}
