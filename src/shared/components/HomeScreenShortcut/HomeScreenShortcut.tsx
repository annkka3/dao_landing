import { useEffect, useMemo, useState } from "react";
import {
  addTelegramMiniAppToHomeScreen,
  checkTelegramHomeScreenStatus,
  onTelegramHomeScreenAdded,
  onTelegramHomeScreenChecked,
  setPreferredHomeScreenLaunchView,
  type MiniAppLaunchView,
  type TelegramHomeScreenStatus,
} from "../../../telegram/webapp";
import "./HomeScreenShortcut.css";

type ShortcutTone = "settings" | "journal";

interface HomeScreenShortcutProps {
  title: string;
  body: string;
  buttonText: string;
  unsupportedText?: string;
  addedText?: string;
  tone?: ShortcutTone;
  launchView?: MiniAppLaunchView;
}

const DEFAULT_UNSUPPORTED =
  "На этом устройстве shortcut недоступен. Открой приложение через Telegram или добавь сайт через Safari -> Share -> Add to Home Screen.";

export function HomeScreenShortcut({
  title,
  body,
  buttonText,
  unsupportedText = DEFAULT_UNSUPPORTED,
  addedText = "Shortcut уже добавлен на экран.",
  tone = "settings",
  launchView,
}: HomeScreenShortcutProps) {
  const [status, setStatus] = useState<TelegramHomeScreenStatus | "checking">("checking");
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const cleanupAdded = onTelegramHomeScreenAdded(() => {
      setStatus("added");
      setRequested(false);
    });
    const cleanupChecked = onTelegramHomeScreenChecked((nextStatus) => {
      setStatus(nextStatus);
    });

    checkTelegramHomeScreenStatus(setStatus);

    return () => {
      cleanupAdded();
      cleanupChecked();
    };
  }, []);

  const message = useMemo(() => {
    if (status === "unsupported") return unsupportedText;
    if (status === "added") return addedText;
    if (requested) return "Проверь системное окно Telegram и подтверди добавление.";
    return body;
  }, [addedText, body, requested, status, unsupportedText]);

  const disabled = status === "checking" || status === "unsupported" || status === "added" || requested;

  function handleAdd() {
    if (launchView) setPreferredHomeScreenLaunchView(launchView);
    if (addTelegramMiniAppToHomeScreen()) {
      setRequested(true);
      return;
    }
    setStatus("unsupported");
  }

  return (
    <section className={`hs-shortcut hs-shortcut--${tone}`}>
      <div className="hs-shortcut__copy">
        <span className="hs-shortcut__eyebrow">Быстрый доступ</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
      {status !== "unsupported" && status !== "added" ? (
        <button className="hs-shortcut__button" type="button" disabled={disabled} onClick={handleAdd}>
          {requested ? "Ожидание..." : buttonText}
        </button>
      ) : null}
    </section>
  );
}
