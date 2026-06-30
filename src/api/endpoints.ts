import { apiFetch } from "./client";
import type {
  AcceptDisclaimerRequest,
  AchievementsListResponse,
  ArchetypesListResponse,
  CancelRoomResponse,
  CreateRoomRequest,
  CurrentRoomResponse,
  DailyResultDTO,
  DailyResultsListResponse,
  FinalCollectionResponse,
  FinalResultDTO,
  GameStateResponse,
  JoinRoomRequest,
  LeaderboardResponse,
  RoomDetailResponse,
  RoomEventFeedResponse,
  RoomParticipantsResponse,
  RoomWithParticipantResponse,
  SelectArchetypeRequest,
  StartRoomResponse,
  SubmitChoiceRequest,
  SubmitChoiceResponse,
  UpdateNotificationSettingsRequest,
  UpdateLanguageRequest,
  UserProfileSummaryResponse,
  UserMeResponse,
} from "./types";

// ─── Users ───────────────────────────────────────────────────────────────────

export function postAuthTelegram(): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/auth/telegram", { method: "POST" });
}

export function getMe(): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/users/me");
}

export function getProfileSummary(): Promise<UserProfileSummaryResponse> {
  return apiFetch<UserProfileSummaryResponse>("/users/profile-summary");
}

export function getFinalCollection(): Promise<FinalCollectionResponse> {
  return apiFetch<FinalCollectionResponse>("/users/final-collection");
}

export function acceptDisclaimer(
  body: AcceptDisclaimerRequest,
  idempotencyKey: string
): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/users/disclaimer", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export function updateNotificationSettings(
  body: UpdateNotificationSettingsRequest
): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/users/notification-settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateLanguage(body: UpdateLanguageRequest): Promise<UserMeResponse> {
  return apiFetch<UserMeResponse>("/users/settings/language", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ─── Archetypes ──────────────────────────────────────────────────────────────

export function getArchetypes(locale = "ru"): Promise<ArchetypesListResponse> {
  return apiFetch<ArchetypesListResponse>(`/archetypes?locale=${locale}`);
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export function createRoom(
  body: CreateRoomRequest,
  idempotencyKey: string
): Promise<RoomWithParticipantResponse> {
  return apiFetch<RoomWithParticipantResponse>("/rooms", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export function joinRoom(
  body: JoinRoomRequest,
  idempotencyKey: string
): Promise<RoomWithParticipantResponse> {
  return apiFetch<RoomWithParticipantResponse>("/rooms/join", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export function getCurrentRoom(): Promise<CurrentRoomResponse> {
  return apiFetch<CurrentRoomResponse>("/rooms/current");
}

export function getRoomById(publicId: string): Promise<RoomDetailResponse> {
  return apiFetch<RoomDetailResponse>(`/rooms/${publicId}`);
}

export function selectArchetype(
  publicId: string,
  body: SelectArchetypeRequest,
  idempotencyKey: string
): Promise<RoomWithParticipantResponse> {
  return apiFetch<RoomWithParticipantResponse>(
    `/rooms/${publicId}/select-archetype`,
    { method: "POST", body: JSON.stringify(body), idempotencyKey }
  );
}

export function startRoom(
  publicId: string,
  idempotencyKey: string
): Promise<StartRoomResponse> {
  return apiFetch<StartRoomResponse>(`/rooms/${publicId}/start`, {
    method: "POST",
    body: JSON.stringify({}),
    idempotencyKey,
  });
}

export function leaveRoom(
  publicId: string,
  idempotencyKey: string
): Promise<RoomWithParticipantResponse> {
  return apiFetch<RoomWithParticipantResponse>(`/rooms/${publicId}/leave`, {
    method: "POST",
    body: JSON.stringify({}),
    idempotencyKey,
  });
}

export function cancelRoom(
  publicId: string,
  idempotencyKey: string
): Promise<CancelRoomResponse> {
  return apiFetch<CancelRoomResponse>(`/rooms/${publicId}/cancel`, {
    method: "POST",
    body: JSON.stringify({}),
    idempotencyKey,
  });
}

export function getLeaderboard(
  publicId: string,
  limit = 20
): Promise<LeaderboardResponse> {
  return apiFetch<LeaderboardResponse>(
    `/rooms/${publicId}/leaderboard?limit=${limit}`
  );
}

export function getRoomParticipants(
  publicId: string
): Promise<RoomParticipantsResponse> {
  return apiFetch<RoomParticipantsResponse>(`/rooms/${publicId}/participants`);
}

export function getRoomEventFeed(
  publicId: string,
  limit = 20
): Promise<RoomEventFeedResponse> {
  return apiFetch<RoomEventFeedResponse>(
    `/rooms/${publicId}/event-feed?limit=${limit}`
  );
}

// ─── Game ────────────────────────────────────────────────────────────────────

export function getGameState(): Promise<GameStateResponse> {
  return apiFetch<GameStateResponse>("/game/state");
}

export function submitChoice(
  body: SubmitChoiceRequest,
  idempotencyKey: string
): Promise<SubmitChoiceResponse> {
  return apiFetch<SubmitChoiceResponse>("/game/submit-choice", {
    method: "POST",
    body: JSON.stringify(body),
    idempotencyKey,
  });
}

export function getDailyResults(): Promise<DailyResultsListResponse> {
  return apiFetch<DailyResultsListResponse>("/game/daily-results");
}

export function getDailyResult(dayNumber: number): Promise<DailyResultDTO> {
  return apiFetch<DailyResultDTO>(`/game/daily-results/${dayNumber}`);
}

export function getFinalResult(): Promise<FinalResultDTO> {
  return apiFetch<FinalResultDTO>("/game/final-result");
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function getAchievements(): Promise<AchievementsListResponse> {
  return apiFetch<AchievementsListResponse>("/users/achievements");
}
