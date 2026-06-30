export type DecimalString = string;

export type TradeDirection = "long" | "short";
export type MarketType = "spot" | "futures";
export type TradingStyle = "spot" | "futures" | "both";
export type TradeStatus = "draft" | "active" | "closed" | "skipped" | "deleted";
export type RiskStatus = "green" | "yellow" | "red";
export type AnalyticsPeriod = "7d" | "30d";

export interface JournalProfile {
  profile_id: string;
  account_id: string;
  account_name: string;
  exchange: string;
  deposit: DecimalString;
  account_currency: string;
  trading_style: TradingStyle;
  risk_per_trade_pct: DecimalString;
  daily_risk_budget_pct: DecimalString;
  weekly_risk_budget_pct: DecimalString;
  max_open_trades: number;
  max_leverage: DecimalString;
  archetype_slug: string | null;
  archetype_recommendation_applied: boolean;
  risk_model_version: string;
  checklist_version: string;
  reward_rules_version: string;
  created_at: string;
  updated_at: string;
}

export interface JournalProfileRequest {
  account_name?: string;
  exchange?: string;
  deposit: DecimalString;
  account_currency?: string;
  trading_style: TradingStyle;
  risk_per_trade_pct: DecimalString;
  daily_risk_budget_pct: DecimalString;
  weekly_risk_budget_pct: DecimalString;
  max_open_trades: number;
  max_leverage: DecimalString;
  archetype_slug?: string | null;
  archetype_recommendation_applied?: boolean;
}

export interface ArchetypeRecommendation {
  archetype_slug: string;
  risk_per_trade_pct: DecimalString;
  daily_risk_budget_pct: DecimalString;
  weekly_risk_budget_pct: DecimalString;
  max_leverage: DecimalString;
  max_open_trades: number;
  description: string;
}

export interface RiskCheckRequest {
  symbol: string;
  direction: TradeDirection;
  market_type: MarketType;
  entry_price: DecimalString;
  stop_loss?: DecimalString | null;
  take_profit?: DecimalString | null;
  leverage?: DecimalString | null;
  position_size: DecimalString;
}

export interface LeverageWarning {
  leverage: DecimalString;
  critical_move_pct: DecimalString;
  level: string;
}

export interface RiskCheckResponse {
  stop_risk_amount: DecimalString | null;
  risk_pct: DecimalString | null;
  rr_ratio: DecimalString | null;
  risk_status: RiskStatus;
  risk_per_trade_limit_pct: DecimalString;
  daily_budget_used_pct: DecimalString;
  daily_budget_limit_pct: DecimalString;
  daily_budget_remaining_pct: DecimalString;
  weekly_budget_used_pct: DecimalString;
  weekly_budget_limit_pct: DecimalString;
  weekly_budget_remaining_pct: DecimalString;
  leverage_warning: LeverageWarning | null;
  warnings: string[];
  validation_errors: string[];
  risk_model_version: string;
}

export interface TradeCreateRequest extends RiskCheckRequest {
  client_request_id: string;
  strategy_tag?: string | null;
  emotional_tag?: string;
  notes?: string | null;
  decision: "confirm" | "save_draft" | "confirm_over_risk" | "cancel";
  override_reason?: string | null;
}

export interface TradeDTO {
  id: string;
  account_id: string;
  symbol: string;
  direction: TradeDirection;
  market_type: MarketType;
  entry_price: DecimalString;
  stop_loss: DecimalString | null;
  take_profit: DecimalString | null;
  position_size: DecimalString;
  leverage: DecimalString;
  status: TradeStatus;
  risk_status: RiskStatus;
  risk_pct: DecimalString | null;
  stop_risk_amount: DecimalString | null;
  rr_ratio: DecimalString | null;
  strategy_tag: string | null;
  emotional_tag: string;
  notes: string | null;
  risk_model_version: string;
  checklist_version: string;
  client_request_id: string | null;
  opened_at: string;
  created_at: string;
}

export interface TradeCreateResponse {
  trade: TradeDTO;
  risk_result: RiskCheckResponse;
  created: boolean;
  idempotent_replay: boolean;
  requires_confirmation: boolean;
  allowed_actions: string[];
  events_written: string[];
}

export interface RiskConfirmationResponse {
  code: "RISK_CONFIRMATION_REQUIRED";
  message: string;
  created: false;
  requires_confirmation: true;
  risk_result: RiskCheckResponse;
  allowed_actions: string[];
  events_written: string[];
}

export type ChecklistItemKey =
  | "has_stop_loss"
  | "risk_within_limit"
  | "rr_acceptable"
  | "has_entry_reason"
  | "matches_strategy"
  | "no_upcoming_news"
  | "no_loss_series"
  | "not_in_tilt"
  | "no_duplicate_risk";

export interface ChecklistRequest {
  items: Record<ChecklistItemKey, boolean>;
  notes?: string | null;
  checklist_version?: string;
}

export interface RewardInfo {
  reward_granted: boolean;
  reward_type: string | null;
  amount: number;
  reward_rules_version: string | null;
  idempotent_replay: boolean;
  cap_exceeded: boolean;
  ineligible_reason: string | null;
}

export interface ChecklistResponse {
  trade_id: string;
  checklist_version: string;
  passed: boolean;
  failed_items: ChecklistItemKey[];
  completion_score: string;
  completed_at: string;
  events_written: string[];
  reward_granted: boolean;
  reward: RewardInfo | null;
}

export type SkipReason =
  | "risk_too_high"
  | "no_clear_plan"
  | "revenge_trade_detected"
  | "over_daily_budget"
  | "over_weekly_budget"
  | "high_leverage"
  | "no_stop_loss"
  | "emotional_state_bad"
  | "market_unclear"
  | "other";

export interface SkipTradeRequest {
  reason: SkipReason;
  notes?: string | null;
  emotional_tag?: string | null;
}

export interface SkipTradeResponse {
  trade_id: string;
  status: TradeStatus;
  reason: SkipReason;
  skipped_at: string;
  events_written: string[];
  reward_granted: boolean;
  reward: RewardInfo | null;
}

export interface OverviewProfile {
  profile_exists: boolean;
  account_id: string;
  deposit: DecimalString;
  account_currency: string;
  trading_style: TradingStyle;
  risk_per_trade_pct: DecimalString;
  daily_risk_budget_pct: DecimalString;
  weekly_risk_budget_pct: DecimalString;
  max_open_trades: number;
  max_leverage: DecimalString;
  risk_model_version: string;
  checklist_version: string;
  reward_rules_version: string;
}

export interface OverviewBudget {
  daily_used_pct: DecimalString;
  daily_limit_pct: DecimalString;
  daily_remaining_pct: DecimalString;
  weekly_used_pct: DecimalString;
  weekly_limit_pct: DecimalString;
  weekly_remaining_pct: DecimalString;
  open_trades_count: number;
  consecutive_losses: number;
}

export interface OverviewActivityToday {
  trades_created: number;
  active_trades: number;
  draft_trades: number;
  skipped_trades: number;
  checklists_completed: number;
  checklists_passed: number;
  no_trade_decisions: number;
}

export interface OverviewRewardsToday {
  sparks_granted: number;
  checklist_rewards: number;
  no_trade_rewards: number;
  reward_rules_version: string;
}

export interface OverviewWarning {
  code: string;
  severity: "danger" | "warning" | "info" | string;
  message: string;
}

export interface TradeSummaryCardData {
  id: string;
  symbol: string;
  direction: TradeDirection;
  market_type: MarketType;
  status: TradeStatus;
  risk_status: RiskStatus;
  risk_pct: DecimalString | null;
  created_at: string;
}

export interface TradeChecklistSummary {
  exists: boolean;
  passed: boolean | null;
  failed_items: ChecklistItemKey[] | string[];
  completion_score: string | null;
  completed_at: string | null;
}

export interface TradeRewardSummary {
  has_journal_reward: boolean;
  checklist_reward_granted: boolean;
  no_trade_reward_granted: boolean;
  sparks_granted_total: number;
}

export interface TradeListItem extends TradeSummaryCardData {
  entry_price: DecimalString;
  stop_loss: DecimalString | null;
  take_profit: DecimalString | null;
  position_size: DecimalString;
  leverage: DecimalString;
  rr_ratio: DecimalString | null;
  strategy_tag: string | null;
  checklist: TradeChecklistSummary;
  reward: TradeRewardSummary;
  updated_at: string;
}

export interface TradeListPagination {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
}

export interface TradeListResponse {
  items: TradeListItem[];
  pagination: TradeListPagination;
}

export interface TradeDetailTrade extends TradeSummaryCardData {
  entry_price: DecimalString;
  stop_loss: DecimalString | null;
  take_profit: DecimalString | null;
  position_size: DecimalString;
  leverage: DecimalString;
  rr_ratio: DecimalString | null;
  strategy_tag: string | null;
  updated_at: string;
  warnings: string[];
  emotional_tag: string;
  risk_model_version: string;
  checklist_version: string;
}

export interface TradeSkipSummary {
  is_skipped: boolean;
  reason: SkipReason | string | null;
  skipped_at: string | null;
}

export interface TradeEventTimelineItem {
  event_type: string;
  created_at: string;
}

export interface TradeDetailResponse {
  trade: TradeDetailTrade;
  checklist: TradeChecklistSummary;
  skip: TradeSkipSummary;
  rewards: TradeRewardSummary;
  events: TradeEventTimelineItem[];
}

export interface JournalOverviewResponse {
  profile: OverviewProfile;
  budget: OverviewBudget;
  activity_today: OverviewActivityToday;
  rewards_today: OverviewRewardsToday;
  latest_trades: TradeSummaryCardData[];
  warnings: OverviewWarning[];
}

export interface AnalyticsPeriodInfo {
  label: AnalyticsPeriod;
  period_days: number;
  period_start: string;
  period_end: string;
}

export interface AnalyticsTradeSummary {
  trades_total: number;
  active_trades: number;
  draft_trades: number;
  closed_trades: number;
  skipped_trades: number;
  long_trades: number;
  short_trades: number;
  spot_trades: number;
  futures_trades: number;
}

export interface AnalyticsRiskSummary {
  avg_risk_pct: DecimalString | null;
  max_risk_pct: DecimalString | null;
  over_limit_trades: number;
  high_leverage_trades: number;
  warnings_count: number;
  overrides_count: number;
}

export interface AnalyticsFailedItem {
  item: ChecklistItemKey | string;
  count: number;
}

export interface AnalyticsChecklistSummary {
  completed: number;
  passed: number;
  failed: number;
  pass_rate: DecimalString | null;
  most_failed_items: AnalyticsFailedItem[];
}

export interface AnalyticsNoTradeSummary {
  decisions: number;
  top_reasons: string[];
}

export interface AnalyticsRewardsSummary {
  sparks_granted: number;
  checklist_rewards: number;
  no_trade_rewards: number;
}

export interface AnalyticsDiscipline {
  score: number | null;
  checklist_consistency: number | null;
  risk_limit_respect: number;
  no_trade_quality: number;
  override_control: number;
  data_quality: string;
}

export interface AnalyticsTilt {
  score: number | null;
  status: string;
  data_quality: string;
}

export interface PatternInsight {
  code: string;
  severity: string;
  description: string;
}

export interface AnalyticsWarning {
  code: string;
  severity: string;
  message: string;
}

export interface JournalAnalyticsResponse {
  period: AnalyticsPeriodInfo;
  trade_summary: AnalyticsTradeSummary;
  risk_summary: AnalyticsRiskSummary;
  checklist_summary: AnalyticsChecklistSummary;
  no_trade_summary: AnalyticsNoTradeSummary;
  rewards_summary: AnalyticsRewardsSummary;
  discipline: AnalyticsDiscipline;
  tilt: AnalyticsTilt;
  patterns: PatternInsight[];
  warnings: AnalyticsWarning[];
}
