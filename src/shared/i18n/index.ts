import { useAppContext } from "../../store/AppContext";

export type SupportedLanguage = "ru" | "en";

export const DEFAULT_LANGUAGE: SupportedLanguage = "ru";
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["ru", "en"];

const RU = {
  "nav.lobby": "ЛОББИ",
  "nav.events": "СОБЫТИЯ",
  "nav.play": "ИГРА",
  "nav.market": "MARKET",
  "nav.profile": "ПРОФИЛЬ",
  "settings.title": "SETTINGS",
  "settings.subtitle": "— НАСТРОЙКИ —",
  "settings.description": "Твой аккаунт, архетип и статус сезона.",
  "settings.account": "АККАУНТ",
  "settings.language.title": "Язык интерфейса",
  "settings.language.hint": "Русский по умолчанию, English можно включить вручную.",
  "settings.language.ru": "Русский",
  "settings.language.en": "English",
  "settings.language.error": "Не удалось сохранить язык",
  "settings.appearance.title": "Внешний вид",
  "settings.appearance.hint": "Системная тема учитывает Telegram или настройки устройства.",
  "settings.appearance.system": "Система",
  "settings.appearance.dark": "Тёмная",
  "settings.appearance.light": "Светлая",
  "settings.notifications.bot": "Игровые уведомления бота",
  "settings.notifications.botHint": "События, бонусы, итоги дня и финал сезона",
  "settings.notifications.app": "Внутренние уведомления",
  "settings.notifications.appHint": "Toast, звук и виброотклик внутри открытой Mini App",
  "settings.back": "НАЗАД",
  "common.loading": "Загрузка...",
  "common.error": "Что-то пошло не так",
  "common.empty": "Пока пусто",
  "common.save": "Сохранить",
  "common.cancel": "Отмена",
  "common.apply": "Применить",
  "dao.cryptoReality": "Crypto Reality",
  "dao.riskGuardian": "Risk Guardian",
  "dao.education": "DAO Education",
  "dao.signals": "DAO Signals",
  "dao.market": "DAO Market",
  "dao.comingSoon": "Раздел готовится",
} as const;

const EN: Partial<Record<keyof typeof RU, string>> = {
  "nav.lobby": "LOBBY",
  "nav.events": "EVENTS",
  "nav.play": "GAME",
  "nav.market": "MARKET",
  "nav.profile": "PROFILE",
  "settings.title": "SETTINGS",
  "settings.subtitle": "— SETTINGS —",
  "settings.description": "Your account, archetype, and season status.",
  "settings.account": "ACCOUNT",
  "settings.language.title": "Interface language",
  "settings.language.hint": "Russian is default; English can be enabled manually.",
  "settings.language.ru": "Русский",
  "settings.language.en": "English",
  "settings.language.error": "Could not save language",
  "settings.appearance.title": "Appearance",
  "settings.appearance.hint": "System follows Telegram or device settings.",
  "settings.appearance.system": "System",
  "settings.appearance.dark": "Dark",
  "settings.appearance.light": "Light",
  "settings.notifications.bot": "Game bot notifications",
  "settings.notifications.botHint": "Events, bonuses, daily results, and season finale",
  "settings.notifications.app": "In-app notifications",
  "settings.notifications.appHint": "Toast, sound, and haptics inside the open Mini App",
  "settings.back": "BACK",
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
  "common.empty": "Nothing here yet",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.apply": "Apply",
  "dao.comingSoon": "Coming soon",
};

export type TranslationKey = keyof typeof RU;

export function normalizeLanguage(value: unknown): SupportedLanguage {
  if (typeof value === "string") {
    const language = value.trim().toLowerCase().split(/[-_]/)[0];
    if (language === "en" || language === "ru") return language;
  }
  return DEFAULT_LANGUAGE;
}

export function translate(
  key: TranslationKey,
  language: unknown = DEFAULT_LANGUAGE,
  params?: Record<string, string | number>
): string {
  const normalized = normalizeLanguage(language);
  const template = (normalized === "en" ? EN[key] : undefined) ?? RU[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(params[name] ?? ""));
}

export function useI18n() {
  const { state } = useAppContext();
  const language = normalizeLanguage(state.user?.language_code);
  return {
    language,
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(key, language, params),
  };
}
