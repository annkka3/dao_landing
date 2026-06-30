import { apiFetch } from "../../api/client";
import { ApiError } from "../../api/errors";
import type {
  AnalyticsPeriod,
  ArchetypeRecommendation,
  ChecklistRequest,
  ChecklistResponse,
  JournalAnalyticsResponse,
  JournalOverviewResponse,
  JournalProfile,
  JournalProfileRequest,
  RiskCheckRequest,
  RiskCheckResponse,
  RiskConfirmationResponse,
  SkipTradeRequest,
  SkipTradeResponse,
  TradeCreateRequest,
  TradeCreateResponse,
  TradeDetailResponse,
  TradeListResponse,
  TradeStatus,
} from "./types";

export function getJournalProfile(): Promise<JournalProfile> {
  return apiFetch<JournalProfile>("/journal/profile");
}

export function saveJournalProfile(body: JournalProfileRequest): Promise<JournalProfile> {
  return apiFetch<JournalProfile>("/journal/profile", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getArchetypeRecommendation(archetypeSlug: string): Promise<ArchetypeRecommendation> {
  return apiFetch<ArchetypeRecommendation>(
    `/journal/archetype-recommendations/${encodeURIComponent(archetypeSlug)}`
  );
}

export function riskCheckTrade(body: RiskCheckRequest): Promise<RiskCheckResponse> {
  return apiFetch<RiskCheckResponse>("/journal/trades/risk-check", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createTrade(
  body: TradeCreateRequest
): Promise<TradeCreateResponse | RiskConfirmationResponse> {
  try {
    return await apiFetch<TradeCreateResponse>("/journal/trades", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (ApiError.isApiError(err) && err.code === "RISK_CONFIRMATION_REQUIRED") {
      return err.details as RiskConfirmationResponse;
    }
    throw err;
  }
}

export function completeChecklist(
  tradeId: string,
  payload: ChecklistRequest
): Promise<ChecklistResponse> {
  return apiFetch<ChecklistResponse>(`/journal/trades/${tradeId}/checklist`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function skipTrade(
  tradeId: string,
  payload: SkipTradeRequest
): Promise<SkipTradeResponse> {
  return apiFetch<SkipTradeResponse>(`/journal/trades/${tradeId}/skip`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getJournalTrades(params: {
  status?: TradeStatus;
  limit?: number;
  offset?: number;
} = {}): Promise<TradeListResponse> {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const query = search.toString();
  return apiFetch<TradeListResponse>(`/journal/trades${query ? `?${query}` : ""}`);
}

export function getJournalTradeDetail(tradeId: string): Promise<TradeDetailResponse> {
  return apiFetch<TradeDetailResponse>(`/journal/trades/${encodeURIComponent(tradeId)}`);
}

export function getJournalOverview(): Promise<JournalOverviewResponse> {
  return apiFetch<JournalOverviewResponse>("/journal/overview");
}

export function getJournalAnalytics(period: AnalyticsPeriod): Promise<JournalAnalyticsResponse> {
  return apiFetch<JournalAnalyticsResponse>(`/journal/analytics?period=${period}`);
}
