import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { createIdempotencyKey } from "../../../../api/idempotency";
import { friendlyErrorMessage } from "../../../../api/errorMessages";
import { useCreateTrade, useRiskCheck } from "../../hooks";
import type { MarketType, RiskCheckRequest, RiskCheckResponse, TradeDirection } from "../../types";
import {
  JournalPageShell,
  RiskBudgetBar,
  RiskStatusBadge,
  WarningCard,
  formatPct,
} from "../../components/JournalComponents";

interface FormState {
  symbol: string;
  direction: TradeDirection;
  market_type: MarketType;
  entry_price: string;
  stop_loss: string;
  take_profit: string;
  position_size: string;
  leverage: string;
  strategy_tag: string;
  notes: string;
}

const initialForm: FormState = {
  symbol: "BTCUSDT",
  direction: "long",
  market_type: "futures",
  entry_price: "",
  stop_loss: "",
  take_profit: "",
  position_size: "",
  leverage: "1",
  strategy_tag: "",
  notes: "",
};

export function AddTradePage({
  onBack,
  onChecklist,
}: {
  onBack?: () => void;
  onChecklist?: (tradeId: string) => void;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [riskResult, setRiskResult] = useState<RiskCheckResponse | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const riskCheck = useRiskCheck();
  const create = useCreateTrade();

  const request = useMemo<RiskCheckRequest>(() => ({
    symbol: form.symbol.trim().toUpperCase(),
    direction: form.direction,
    market_type: form.market_type,
    entry_price: form.entry_price,
    stop_loss: form.stop_loss || null,
    take_profit: form.take_profit || null,
    position_size: form.position_size,
    leverage: form.leverage || null,
  }), [form]);

  async function handleRiskCheck() {
    setConfirmationMessage(null);
    const result = await riskCheck.mutateAsync(request);
    setRiskResult(result);
  }

  async function handleCreate(decision: "confirm" | "save_draft" | "confirm_over_risk") {
    setConfirmationMessage(null);
    const result = await create.mutateAsync({
      ...request,
      client_request_id: createIdempotencyKey("journal-trade"),
      decision,
      strategy_tag: form.strategy_tag || null,
      notes: form.notes || null,
      emotional_tag: "neutral",
    });

    if ("requires_confirmation" in result && result.requires_confirmation && !("trade" in result)) {
      setRiskResult(result.risk_result);
      setConfirmationMessage(result.message);
      return;
    }

    if ("trade" in result) {
      onChecklist?.(result.trade.id);
    }
  }

  return (
    <JournalPageShell title="Добавить сделку" subtitle="Сначала расчёт риска, затем запись сделки." onBack={onBack}>
      <form className="jg-form" onSubmit={(event) => { event.preventDefault(); void handleRiskCheck(); }}>
        <Field label="Symbol"><input className="jg-input" value={form.symbol} onChange={(e) => set("symbol", e.target.value)} /></Field>
        <div className="jg-segmented">
          <button type="button" aria-pressed={form.direction === "long"} onClick={() => set("direction", "long")}>LONG</button>
          <button type="button" aria-pressed={form.direction === "short"} onClick={() => set("direction", "short")}>SHORT</button>
        </div>
        <div className="jg-segmented">
          <button type="button" aria-pressed={form.market_type === "spot"} onClick={() => set("market_type", "spot")}>SPOT</button>
          <button type="button" aria-pressed={form.market_type === "futures"} onClick={() => set("market_type", "futures")}>FUTURES</button>
        </div>
        <Field label="Entry price"><input className="jg-input" inputMode="decimal" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} required /></Field>
        <Field label="Stop loss"><input className="jg-input" inputMode="decimal" value={form.stop_loss} onChange={(e) => set("stop_loss", e.target.value)} /></Field>
        <Field label="Take profit"><input className="jg-input" inputMode="decimal" value={form.take_profit} onChange={(e) => set("take_profit", e.target.value)} /></Field>
        <Field label="Position size"><input className="jg-input" inputMode="decimal" value={form.position_size} onChange={(e) => set("position_size", e.target.value)} required /></Field>
        <Field label="Leverage"><input className="jg-input" inputMode="decimal" value={form.leverage} onChange={(e) => set("leverage", e.target.value)} /></Field>
        <Field label="Strategy tag"><input className="jg-input" value={form.strategy_tag} onChange={(e) => set("strategy_tag", e.target.value)} /></Field>
        <Field label="Notes"><textarea className="jg-textarea" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
        <Button type="submit" loading={riskCheck.isPending}>Calculate Risk</Button>
      </form>

      {riskCheck.isError && <WarningCard warning={{ code: "risk_check_error", severity: "danger", message: friendlyErrorMessage(riskCheck.error) }} />}
      {create.isError && <WarningCard warning={{ code: "trade_create_error", severity: "danger", message: friendlyErrorMessage(create.error) }} />}
      {confirmationMessage && <WarningCard warning={{ code: "risk_confirmation_required", severity: "warning", message: confirmationMessage }} />}

      {riskResult && (
        <section className="jg-card">
          <span className="jg-card__eyebrow">Risk result</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <h2>Риск сделки: {formatPct(riskResult.risk_pct)}</h2>
            <RiskStatusBadge status={riskResult.risk_status} />
          </div>
          <p>RR: {riskResult.rr_ratio ?? "—"} · Stop risk: {riskResult.stop_risk_amount ?? "—"}</p>
          <RiskBudgetBar label="Дневной бюджет после сделки" usedPct={riskResult.daily_budget_used_pct} limitPct={riskResult.daily_budget_limit_pct} remainingPct={riskResult.daily_budget_remaining_pct} status={riskResult.risk_status} />
          <RiskBudgetBar label="Недельный бюджет после сделки" usedPct={riskResult.weekly_budget_used_pct} limitPct={riskResult.weekly_budget_limit_pct} remainingPct={riskResult.weekly_budget_remaining_pct} status={riskResult.risk_status} />
          {riskResult.leverage_warning && (
            <WarningCard warning={{ code: "leverage_warning", severity: riskResult.leverage_warning.level, message: `Леверидж ${riskResult.leverage_warning.leverage}, критическое движение ${riskResult.leverage_warning.critical_move_pct}%.` }} />
          )}
          {riskResult.warnings.map((message, index) => (
            <WarningCard key={`${message}-${index}`} warning={{ code: "risk_warning", severity: riskResult.risk_status === "red" ? "danger" : "warning", message }} />
          ))}
          <div className="jg__actions">
            <Button variant="secondary" onClick={() => handleCreate("save_draft")} loading={create.isPending}>Save Draft</Button>
            <Button variant="primary" onClick={() => handleCreate(riskResult.risk_status === "red" ? "confirm_over_risk" : "confirm")} loading={create.isPending}>
              Continue
            </Button>
          </div>
        </section>
      )}
    </JournalPageShell>
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="jg-field"><span>{label}</span>{children}</label>;
}
