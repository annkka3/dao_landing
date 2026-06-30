import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { ApiError } from "../../../../api/errors";
import { friendlyErrorMessage } from "../../../../api/errorMessages";
import { useJournalProfile, useSaveJournalProfile } from "../../hooks";
import type { JournalProfileRequest, TradingStyle } from "../../types";
import {
  JournalErrorState,
  JournalLoadingState,
  JournalPageShell,
  WarningCard,
} from "../../components/JournalComponents";

const defaults: JournalProfileRequest = {
  account_name: "Default Account",
  exchange: "manual",
  deposit: "1000",
  account_currency: "USDT",
  trading_style: "both",
  risk_per_trade_pct: "1",
  daily_risk_budget_pct: "3",
  weekly_risk_budget_pct: "8",
  max_open_trades: 3,
  max_leverage: "3",
  archetype_slug: null,
  archetype_recommendation_applied: false,
};

export function RiskProfilePage({ onBack, onSaved }: { onBack?: () => void; onSaved?: () => void }) {
  const profile = useJournalProfile();
  const save = useSaveJournalProfile();
  const [form, setForm] = useState<JournalProfileRequest>(defaults);

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      account_name: profile.data.account_name,
      exchange: profile.data.exchange,
      deposit: profile.data.deposit,
      account_currency: profile.data.account_currency,
      trading_style: profile.data.trading_style,
      risk_per_trade_pct: profile.data.risk_per_trade_pct,
      daily_risk_budget_pct: profile.data.daily_risk_budget_pct,
      weekly_risk_budget_pct: profile.data.weekly_risk_budget_pct,
      max_open_trades: profile.data.max_open_trades,
      max_leverage: profile.data.max_leverage,
      archetype_slug: profile.data.archetype_slug,
      archetype_recommendation_applied: profile.data.archetype_recommendation_applied,
    });
  }, [profile.data]);

  const isMissingProfile = profile.isError && ApiError.isApiError(profile.error) && profile.error.code === "PROFILE_NOT_FOUND";

  async function submit() {
    await save.mutateAsync(form);
    onSaved?.();
  }

  return (
    <JournalPageShell title="Правила риска" subtitle="Your risk rules, не торговые сигналы." onBack={onBack}>
      {profile.isLoading ? (
        <JournalLoadingState />
      ) : profile.isError && !isMissingProfile ? (
        <JournalErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      ) : (
        <form className="jg-form" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          {isMissingProfile && (
            <WarningCard warning={{ code: "profile_required", severity: "info", message: "Сначала настрой свои правила риска." }} />
          )}
          <Field label="Deposit"><input className="jg-input" inputMode="decimal" value={form.deposit} onChange={(e) => set("deposit", e.target.value)} required /></Field>
          <Field label="Currency"><input className="jg-input" value={form.account_currency} onChange={(e) => set("account_currency", e.target.value.toUpperCase())} /></Field>
          <label className="jg-field">
            <span>Trading style</span>
            <select className="jg-select" value={form.trading_style} onChange={(e) => set("trading_style", e.target.value as TradingStyle)}>
              <option value="spot">Spot</option>
              <option value="futures">Futures</option>
              <option value="both">Both</option>
            </select>
          </label>
          <Field label="Risk per trade %"><input className="jg-input" inputMode="decimal" value={form.risk_per_trade_pct} onChange={(e) => set("risk_per_trade_pct", e.target.value)} required /></Field>
          <Field label="Daily risk budget %"><input className="jg-input" inputMode="decimal" value={form.daily_risk_budget_pct} onChange={(e) => set("daily_risk_budget_pct", e.target.value)} required /></Field>
          <Field label="Weekly risk budget %"><input className="jg-input" inputMode="decimal" value={form.weekly_risk_budget_pct} onChange={(e) => set("weekly_risk_budget_pct", e.target.value)} required /></Field>
          <Field label="Max leverage"><input className="jg-input" inputMode="decimal" value={form.max_leverage} onChange={(e) => set("max_leverage", e.target.value)} required /></Field>
          <Field label="Max open trades"><input className="jg-input" inputMode="numeric" value={form.max_open_trades} onChange={(e) => set("max_open_trades", Number.parseInt(e.target.value || "1", 10))} required /></Field>
          <Button type="submit" loading={save.isPending}>Сохранить правила</Button>
          {save.isError && <WarningCard warning={{ code: "profile_save_error", severity: "danger", message: friendlyErrorMessage(save.error) }} />}
          {save.isSuccess && <WarningCard warning={{ code: "profile_saved", severity: "info", message: "Правила риска сохранены." }} />}
        </form>
      )}
    </JournalPageShell>
  );

  function set<K extends keyof JournalProfileRequest>(key: K, value: JournalProfileRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="jg-field"><span>{label}</span>{children}</label>;
}
