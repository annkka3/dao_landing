import { ApiError } from "./errors";

const MESSAGES: Record<string, string> = {
  NO_ACTIVE_GAME: "Сейчас нет активной игры.",
  GAME_NOT_ACTIVE: "Комната сейчас не активна.",
  NO_ACTIVE_DAY: "Сейчас нет активного игрового дня.",
  EVENT_NOT_FOUND: "Это событие недоступно.",
  EVENT_WINDOW_CLOSED: "Окно для этого события уже закрылось.",
  EVENT_ALREADY_COMPLETED: "Ты уже сделал выбор для этого события.",
  EVENING_BONUS_LOCKED: "Вечерний бонус откроется после утра и дня.",
  INVALID_CHOICE: "Этот вариант больше недоступен. Обнови страницу.",
  ROOM_NOT_FOUND: "Комната не найдена.",
  ROOM_NOT_IN_LOBBY: "Игра в этой комнате уже началась.",
  ROOM_ALREADY_STARTED: "Эта комната уже стартовала — присоединиться нельзя.",
  ROOM_FULL: "В комнате больше нет мест.",
  ROOM_START_NOT_READY: "Комната ещё не готова к старту.",
  ARCHETYPE_REQUIRED_BEFORE_START: "Не все участники выбрали архетип.",
  ARCHETYPE_SELECTION_CLOSED: "Игра уже началась — архетип менять нельзя.",
  ROOM_CANNOT_BE_CANCELLED: "Эту комнату нельзя отменить — игра уже идёт.",
  CREATOR_CANNOT_LEAVE_LOBBY: "Создатель не может просто выйти — отмени лобби вместо этого.",
  ACTIVE_GAME_ALREADY_EXISTS: "У тебя уже есть активная игра.",
  INVALID_ARCHETYPE: "Этот архетип недоступен.",
  INVALID_INVITE_CODE: "Комната с таким кодом не найдена.",
  NOT_A_ROOM_PARTICIPANT: "Ты не участник этой комнаты.",
  NOT_A_ROOM_CREATOR: "Это действие доступно только создателю комнаты.",
  FAST_FORWARD_NOT_ALLOWED: "Ускоренный режим доступен только тестовым аккаунтам.",
  MARKET_ITEM_NOT_FOUND: "Этот предмет не найден.",
  MARKET_ITEM_NOT_AVAILABLE: "Этот предмет сейчас недоступен.",
  MARKET_ITEM_SOLD_OUT: "Предмет распродан.",
  MARKET_ITEM_NOT_PURCHASABLE: "Этот предмет пока нельзя купить.",
  INSUFFICIENT_SPARKS: "Недостаточно Искр.",
  USER_ITEM_NOT_FOUND: "Предмет не найден в инвентаре.",
  USER_ITEM_NOT_EQUIPPABLE: "Этот предмет нельзя надеть.",
  USER_ITEM_ALREADY_EQUIPPED: "Предмет уже надет.",
  EQUIPPED_ITEM_NOT_FOUND: "В этом слоте ничего не надето.",
};

export function friendlyErrorMessage(
  err: unknown,
  fallback = "Что-то пошло не так. Попробуй ещё раз."
): string {
  if (ApiError.isApiError(err)) {
    return MESSAGES[err.code] ?? err.message ?? fallback;
  }
  return fallback;
}
