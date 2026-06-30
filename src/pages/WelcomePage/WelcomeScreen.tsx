import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import logo from "../../assets/brand/logo-full.svg";
import { DisclaimerModal } from "../../features/disclaimer/components/DisclaimerModal";
import { Button } from "../../shared/ui/Button/Button";
import { HoloCR } from "../../shared/ui/HoloCR/HoloCR";
import { acceptDisclaimer } from "../../api/endpoints";
import { createIdempotencyKey } from "../../api/idempotency";
import type { UserMeResponse } from "../../api/types";
import "../screen.css";
import "./WelcomeScreen.css";

export interface WelcomeScreenProps {
  user?: UserMeResponse | null;
  onStart?: () => void;
  onDisclaimerAccepted?: (user: UserMeResponse) => void;
}

export function WelcomeScreen({ user, onStart, onDisclaimerAccepted }: WelcomeScreenProps) {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      acceptDisclaimer(
        { version: user?.disclaimer_current_version ?? 1 },
        createIdempotencyKey("accept-disclaimer")
      ),
    onSuccess: (updatedUser) => {
      setDisclaimerOpen(false);
      onDisclaimerAccepted?.(updatedUser);
      onStart?.();
    },
  });

  return (
    <main className="welcome-screen">
      <div className="welcome-screen__panel">
        <HoloCR size={110} />
        <img className="welcome-screen__logo" src={logo} alt="Crypto Reality" />
        <div className="welcome-screen__card">
          <p>7 дней крипто-хаоса. Выбери архетип и доживи до пятницы.</p>
          <Button fullWidth className="welcome-screen__cta" onClick={() => setDisclaimerOpen(true)}>
            Начать игру
          </Button>
          <small>Игровой сценарий. Не финансовый совет.</small>
          {mutation.isError && <small>Не удалось сохранить согласие. Попробуй ещё раз.</small>}
        </div>
      </div>
      <DisclaimerModal
        accepted={accepted}
        onAccept={() => mutation.mutate()}
        onAcceptedChange={setAccepted}
        open={disclaimerOpen}
      />
    </main>
  );
}
