/** All API response/request types, derived from docs/api_contract_mvp.md. */

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface StatsDTO {
  bankroll: number;
  discipline: number;
  fomo: number;
  reputation: number;
  alpha: number;
  stress: number;
  degen_index: number;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserMeResponse {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  language_code: string;
  disclaimer_version_accepted: number | null;
  disclaimer_accepted_at: string | null;
  disclaimer_current_version: number;
  disclaimer_is_accepted: boolean;
  current_participant_id: number | null;
  has_active_game: boolean;
  can_fast_forward: boolean;
  game_bot_notifications_enabled: boolean;
}

export interface FavoriteArchetypeSummaryDTO {
  slug: string;
  seasons: number;
}

export interface UserProfileSummaryResponse {
  seasons_played: number;
  favorite_archetype: FavoriteArchetypeSummaryDTO | null;
  best_rank: number | null;
  wins_count: number;
  total_score: number;
}

export interface FinalCollectionCardDTO {
  id: number;
  room_public_id: string;
  room_title: string;
  finalized_at: string;
  final_title: string;
  final_title_description: string;
  archetype_slug: string | null;
  score: number;
  rank: number;
  total_players: number;
  main_bonus_title: string | null;
  main_bonus_points: number | null;
  nomination_title: string | null;
  nomination_points: number | null;
}

export interface FinalCollectionResponse {
  items: FinalCollectionCardDTO[];
}

export interface AcceptDisclaimerRequest {
  version: number;
}

export interface UpdateNotificationSettingsRequest {
  game_bot_notifications_enabled: boolean;
}

export interface UpdateLanguageRequest {
  language_code: "ru" | "en";
}

// ─── Archetypes ──────────────────────────────────────────────────────────────

export interface ArchetypeStartingStats {
  bankroll: number;
  discipline: number;
  fomo: number;
  reputation: number;
  alpha: number;
  stress: number;
  degen_index: number;
}

export interface ArchetypeItem {
  slug: string;
  name: string;
  description: string;
  strengths: string;
  weaknesses: string;
  starting_stats: ArchetypeStartingStats;
  sort_order: number;
}

export interface ArchetypesListResponse {
  items: ArchetypeItem[];
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export type RoomStatus = "lobby" | "active" | "finished" | "cancelled";

export interface RoomDTO {
  public_id: string;
  title: string;
  invite_code: string;
  status: RoomStatus;
  timezone: string;
  demo_mode: boolean;
  fast_forward_mode: boolean;
  season_length_days: number;
  starts_at: string | null;
  started_at: string | null;
  finished_at: string | null;
  cancelled_at: string | null;
  creator_user_id: number;
}

export interface ParticipantDTO {
  id: number;
  status: string;
  archetype_slug: string | null;
  is_creator: boolean;
}

export interface RoomDayDTO {
  day_number: number;
  status: string;
  morning_start: string;
  morning_end: string;
  day_start: string;
  day_end: string;
  evening_start: string;
  evening_end: string;
}

export interface RoomWithParticipantResponse {
  room: RoomDTO;
  participant: ParticipantDTO;
}

export interface CurrentRoomResponse {
  room: RoomDTO | null;
  participant: ParticipantDTO | null;
}

export interface RoomDetailResponse {
  room: RoomDTO;
  participant: ParticipantDTO | null;
}

export interface StartRoomResponse {
  room: RoomDTO;
  participants: ParticipantDTO[];
  room_days: RoomDayDTO[];
}

export interface CancelRoomResponse {
  room: RoomDTO;
}

export interface CreateRoomRequest {
  title: string;
  timezone: string;
  demo_mode?: boolean;
  fast_forward_mode?: boolean;
}

export interface JoinRoomRequest {
  invite_code: string;
}

export interface SelectArchetypeRequest {
  archetype_slug: string;
}

export interface LeaderboardEntryDTO {
  rank: number;
  participant_id: number;
  display_name: string;
  archetype_slug: string | null;
  score: number;
  stats: StatsDTO;
  completed_events_count: number;
  missed_events_count: number;
  is_current_user: boolean;
  character_skin?: {
    slug: string;
    title: string;
    cutouts: Partial<Record<"fullNeutral" | "neutral" | "win" | "rekt", string | null>>;
  } | null;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntryDTO[];
  total_participants: number;
  current_user_rank: number | null;
  current_user_entry: LeaderboardEntryDTO | null;
}

export interface RoomParticipantSummaryDTO {
  participant_id: number;
  display_name: string;
  archetype_slug: string | null;
  is_creator: boolean;
  has_archetype: boolean;
}

export interface RoomParticipantsResponse {
  participants: RoomParticipantSummaryDTO[];
}

export interface RoomEventFeedItemDTO {
  id: number;
  participant_id: number;
  display_name: string;
  archetype_slug: string | null;
  event_type: EventType;
  status: "completed" | "missed";
  day_number: number;
  score_delta: number;
  occurred_at: string;
}

export interface RoomEventFeedResponse {
  items: RoomEventFeedItemDTO[];
}

// ─── Game ────────────────────────────────────────────────────────────────────

export interface GameRoomDTO {
  public_id: string;
  title: string;
  status: string;
  timezone: string;
  demo_mode: boolean;
  season_length_days: number;
  starts_at: string | null;
  started_at: string | null;
}

export interface GameParticipantDTO {
  id: number;
  status: string;
  archetype_slug: string | null;
  is_creator: boolean;
  score: number;
  stats: StatsDTO;
}

export interface GameRoomDayDTO {
  day_number: number;
  status: string;
  morning_start: string;
  morning_end: string;
  day_start: string;
  day_end: string;
  evening_start: string;
  evening_end: string;
}

export interface GameChoiceDTO {
  id: number;
  choice_number: number;
  text: string;
}

export interface GameSituationDTO {
  id: number;
  slug: string;
  event_type: string;
  category: string;
  title: string;
  text: string;
  choices: GameChoiceDTO[];
}

export interface GameChoiceStatsEntryDTO {
  choice_number: number;
  count: number;
  percent: number;
}

export interface GameChoiceStatsDTO {
  total_answers: number;
  choices: GameChoiceStatsEntryDTO[];
}

export type EventStatus = "locked" | "available" | "completed" | "missed";
export type EventType = "morning" | "day" | "evening_bonus";

export interface GameEventDTO {
  event_type: EventType;
  status: EventStatus;
  window_start: string;
  window_end: string;
  situation: GameSituationDTO | null;
  choice_stats: GameChoiceStatsDTO | null;
}

export type GameState = "no_game" | "lobby" | "active" | "finished";

export interface GameStateResponse {
  state: GameState;
  room: GameRoomDTO | null;
  participant: GameParticipantDTO | null;
  current_day: GameRoomDayDTO | null;
  events: GameEventDTO[];
  server_time: string;
}

export interface SubmitChoiceRequest {
  event_type: EventType;
  choice_id: number;
}

export interface SubmitChoiceEventDTO {
  event_type: string;
  status: string;
  completed_at: string;
  chosen_choice_id: number;
}

export interface SubmitChoiceResultDTO {
  result_text: string;
  effects: Record<string, number>;
  score_delta: number;
}

export interface SubmitChoiceResponse {
  event: SubmitChoiceEventDTO;
  result: SubmitChoiceResultDTO;
  participant: GameParticipantDTO;
}

// Scoring v2-light bonus/nomination shape (daily_results.bonuses_applied,
// final_results.results_snapshot.final_bonuses, final_results.final_nominations).
// See docs/game_balance_v1.md §5а.
export interface ScoreBonusDTO {
  slug: string;
  title: string;
  points: number;
  reason: string;
  category: string;
}

export interface DailyResultDTO {
  day_number: number;
  score_delta: number;
  total_score_after: number;
  stats_snapshot: StatsDTO;
  events_snapshot: Record<string, unknown> | null;
  bonuses_applied: ScoreBonusDTO[] | null;
  finalized_at: string;
}

export interface DailyResultsListResponse {
  items: DailyResultDTO[];
}

export interface FinalResultSnapshotDailyEntry {
  day_number: number;
  score_delta: number;
  total_score_after: number;
}

export interface FinalResultDTO {
  final_rank: number;
  final_score: number;
  final_stats: StatsDTO;
  results_snapshot: {
    events_summary: {
      completed: number;
      missed: number;
      evening_bonus_completed: number;
    };
    daily_results: FinalResultSnapshotDailyEntry[];
    score_before_final_bonuses?: number;
    final_bonus_total?: number;
    final_bonuses?: ScoreBonusDTO[];
  } | null;
  final_nominations: ScoreBonusDTO[] | null;
  scoring_version: string;
  finalized_at: string;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementCategory =
  | "season"
  | "consistency"
  | "risk"
  | "archetype"
  | "comeback"
  | "social";

export interface AchievementDTO {
  slug: string;
  title: string;
  description: string;
  icon_key: string | null;
  category: AchievementCategory;
  rarity: AchievementRarity;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export interface AchievementsListResponse {
  items: AchievementDTO[];
}
