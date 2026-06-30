import { archetypeAssets, type ArchetypeId, type ArchetypeMood } from "../assets/archetypeAssets";
import { getTelegramBotLink, triggerHaptic } from "../../telegram/webapp";
import type { StatsDTO } from "../../api/types";

export type ShareGameCardKind =
  | "season_title"
  | "season_archetype"
  | "season_result"
  | "wild_moment"
  | "stats_summary"
  | "dao_nominations"
  | "invite"
  | "day_final"
  | "choice_final";

export type ShareRankTone = "first" | "second" | "third" | "all";

export interface ShareGameCardInput {
  kind: ShareGameCardKind;
  archetypeId?: ArchetypeId | null;
  title?: string;
  subtitle?: string;
  description?: string;
  score?: number;
  seasonScore?: number;
  rank?: number;
  rankTotal?: number;
  rankTone?: ShareRankTone;
  roomCode?: string;
  dayNumber?: number;
  seasonLength?: number;
  stats?: StatsDTO | null;
  nominations?: Array<{ title: string; points?: number; reason?: string }>;
  effects?: Record<string, number>;
  choiceText?: string;
  eventTitle?: string;
  resultText?: string;
  footer?: string;
  link?: string;
  shareText?: string;
  templateSlug?: string | null;
  skinCutouts?: Partial<Record<ArchetypeMood | "fullNeutral", string>> | null;
}

export type ShareGameCardResult = "shared" | "downloaded";

const CARD_W = 1080;
const CARD_H = 1350;
const CYAN = "#00e5ff";
const GOLD = "#ffd23f";
const GREEN = "#7cff2e";
const RED = "#ff4d4d";
const PAGE_BG = "#000002";
const fallbackBotLink = () => getTelegramBotLink();

const ARCHETYPE_NAMES: Record<ArchetypeId, { en: string; ru: string; tagline: string }> = {
  risk_manager: {
    en: "RISK MANAGER",
    ru: "Риск-менеджер",
    tagline: "Холодная голова там, где рынок шумит громче логики.",
  },
  meme_degen: {
    en: "MEME DEGEN",
    ru: "Мем-коин деген",
    tagline: "Ты слышал вайб рынка раньше, чем он стал графиком.",
  },
  onchain_detective: {
    en: "ONCHAIN DETECTIVE",
    ru: "Ончейн-детектив",
    tagline: "Пока чат спорил, ты проверял следы на цепи.",
  },
  leverage_cowboy: {
    en: "LEVERAGE COWBOY",
    ru: "Ковбой плеча",
    tagline: "Ты ехал быстро, но сезон требовал держать поводья.",
  },
  hodl_monk: {
    en: "HODL MONK",
    ru: "HODL-монах",
    tagline: "Спокойствие было твоим самым дорогим активом.",
  },
  airdrop_farmer: {
    en: "AIRDROP FARMER",
    ru: "Аирдроп-фермер",
    tagline: "Ты искал шанс там, где другие видели только мелкий клик.",
  },
  moon_prophet: {
    en: "MOON PROPHET",
    ru: "Мун-пророк",
    tagline: "WAGMI. Пока другие сомневались, ты смотрел вверх.",
  },
  capitulation_doomer: {
    en: "CAPITULATION DOOMER",
    ru: "Капитуляционный думер",
    tagline: "Ты видел риск раньше, чем он стал красной свечой.",
  },
};

const STAT_LABELS: Record<keyof StatsDTO, string> = {
  bankroll: "БАНКРОЛЛ",
  discipline: "ДИСЦИПЛИНА",
  fomo: "FOMO",
  reputation: "РЕПУТАЦИЯ",
  alpha: "АЛЬФА",
  stress: "СТРЕСС",
  degen_index: "DEGEN",
};

const STAT_COLORS: Record<keyof StatsDTO, string> = {
  bankroll: "#22c55e",
  discipline: "#38bdf8",
  fomo: "#a855f7",
  reputation: GOLD,
  alpha: "#ff8a1f",
  stress: RED,
  degen_index: CYAN,
};

export async function shareGameCard(input: ShareGameCardInput): Promise<ShareGameCardResult> {
  const file = await createShareGameCardFile(input);
  const text = shareTextFor(input);

  if (canShareFile(file)) {
    await navigator.share({
      title: "Crypto Reality",
      text,
      files: [file],
    });
    triggerHaptic("success");
    return "shared";
  }

  downloadFile(file);
  triggerHaptic("success");
  return "downloaded";
}

export async function createShareGameCardFile(input: ShareGameCardInput): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable");

  await drawCard(ctx, normalizeInput(input));
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value);
      else reject(new Error("Failed to render share card"));
    }, "image/png", 0.95);
  });

  return new File([blob], `crypto-reality-${input.kind}.png`, { type: "image/png" });
}

function normalizeInput(input: ShareGameCardInput): Required<Pick<ShareGameCardInput, "kind">> & ShareGameCardInput {
  return {
    ...input,
    kind: input.kind,
    archetypeId: input.archetypeId ?? "risk_manager",
    rankTone: input.rankTone ?? rankToneFromRank(input.rank),
    footer: input.footer ?? "CRYPTO REALITY · ВЫЖИВИ ДО ПЯТНИЦЫ",
    link: input.link ?? fallbackBotLink(),
  };
}

async function drawCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput) {
  const archetypeId = isArchetypeId(input.archetypeId) ? input.archetypeId : "risk_manager";
  const assets = archetypeAssets[archetypeId];
  const cutouts = { ...assets.cutout, ...(input.skinCutouts ?? {}) };
  const rankTone = input.rankTone ?? rankToneFromRank(input.rank);
  const tone = rankColor(rankTone);

  fillBase(ctx, rankTone);
  await drawBackground(ctx, backgroundFor(input, assets.background), rankTone);
  drawGrid(ctx);
  drawBrand(ctx);

  if (input.kind === "stats_summary") {
    await drawHero(ctx, cutouts.fullNeutral, 500, 126, 700, 850, tone, 0.88);
    drawStatsCard(ctx, input, tone);
  } else if (input.kind === "invite") {
    await drawHero(ctx, cutouts.fullNeutral, 240, 146, 650, 820, tone, 0.88);
    drawInviteCard(ctx, input, tone);
  } else if (input.kind === "choice_final") {
    await drawHero(ctx, input.score != null && input.score < 0 ? cutouts.rekt : cutouts.win, 604, 168, 520, 650, tone, 0.82);
    drawChoiceCard(ctx, input, tone);
  } else {
    const mood = input.kind === "day_final" && (input.score ?? 0) < 0 ? "rekt" : "win";
    const isSeasonResult = input.kind === "season_result";
    await drawHero(
      ctx,
      input.kind === "season_archetype" ? cutouts.fullNeutral : cutouts[mood],
      isSeasonResult ? 130 : 250,
      116,
      isSeasonResult ? 540 : 650,
      820,
      tone,
      0.9
    );
    if (input.kind === "season_title") drawSeasonTitleCard(ctx, input, tone);
    if (input.kind === "season_archetype") drawArchetypeCard(ctx, input, archetypeId, tone);
    if (input.kind === "season_result") drawSeasonResultCard(ctx, input, tone);
    if (input.kind === "wild_moment") drawWildMomentCard(ctx, input, tone);
    if (input.kind === "dao_nominations") drawNominationsCard(ctx, input, tone);
    if (input.kind === "day_final") drawDayFinalCard(ctx, input, tone);
  }

  drawFooter(ctx, input.footer ?? "CRYPTO REALITY · ВЫЖИВИ ДО ПЯТНИЦЫ", input.link ?? fallbackBotLink());
}

function fillBase(ctx: CanvasRenderingContext2D, tone: ShareRankTone) {
  ctx.fillStyle = PAGE_BG;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  const g = ctx.createRadialGradient(540, 470, 40, 540, 470, 820);
  g.addColorStop(0, withAlpha(rankColor(tone), 0.26));
  g.addColorStop(0.48, "rgba(0, 229, 255, 0.08)");
  g.addColorStop(1, "rgba(0, 0, 2, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
}

async function drawBackground(ctx: CanvasRenderingContext2D, src: string, tone: ShareRankTone) {
  const img = await loadImage(src).catch(() => null);
  if (img) {
    drawCoverImage(ctx, img, 0, 0, CARD_W, CARD_H);
  }

  const fade = ctx.createLinearGradient(0, 0, 0, CARD_H);
  fade.addColorStop(0, "rgba(0,0,2,0.78)");
  fade.addColorStop(0.18, "rgba(0,0,2,0.24)");
  fade.addColorStop(0.62, "rgba(0,0,2,0.28)");
  fade.addColorStop(1, "rgba(0,0,2,0.9)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.fillStyle = withAlpha(rankColor(tone), 0.08);
  ctx.fillRect(0, 0, CARD_W, CARD_H);
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 60; x < CARD_W; x += 120) {
    line(ctx, x, 120, x, CARD_H - 120);
  }
  for (let y = 180; y < CARD_H; y += 120) {
    line(ctx, 50, y, CARD_W - 50, y);
  }
  ctx.restore();
}

function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "900 50px Arial, sans-serif";
  const gradient = ctx.createLinearGradient(300, 78, 780, 78);
  gradient.addColorStop(0, GOLD);
  gradient.addColorStop(0.48, "#ffe789");
  gradient.addColorStop(0.52, CYAN);
  gradient.addColorStop(1, "#79f4ff");
  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(0, 229, 255, 0.45)";
  ctx.shadowBlur = 20;
  ctx.fillText("CRYPTO REALITY", CARD_W / 2, 86);
  ctx.shadowBlur = 0;
  ctx.font = "600 28px Arial, sans-serif";
  ctx.fillStyle = GREEN;
  ctx.fillText("— ВЫЖИВИ ДО ПЯТНИЦЫ —", CARD_W / 2, 126);
  ctx.restore();
}

async function drawHero(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  opacity: number
) {
  const img = await loadImage(src).catch(() => null);
  ctx.save();
  const glow = ctx.createRadialGradient(x + w * 0.52, y + h * 0.52, 40, x + w * 0.52, y + h * 0.52, Math.max(w, h) * 0.58);
  glow.addColorStop(0, withAlpha(color, 0.28));
  glow.addColorStop(0.55, withAlpha(CYAN, 0.14));
  glow.addColorStop(1, "rgba(0,0,2,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 80, y - 80, w + 160, h + 160);
  if (img) {
    ctx.globalAlpha = opacity;
    ctx.shadowColor = withAlpha(color, 0.85);
    ctx.shadowBlur = 34;
    drawContainImage(ctx, img, x, y, w, h);
  }
  ctx.restore();
}

function drawSeasonTitleCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 70, 802, 940, 340, color);
  smallKicker(ctx, "ТВОЙ ТИТУЛ СЕЗОНА", 110, 872, color);
  bigTitle(ctx, input.title ?? "ПОСЛЕДНИЙ РОМАНТИК АЛЬТСЕЗОНА", 110, 954, 48, 780);
  bodyText(ctx, input.subtitle ?? input.description ?? "Ты верил в невозможное, когда остальные искали быстрый вход.", 112, 1042, 34, 780, 2);
}

function drawArchetypeCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, archetypeId: ArchetypeId, color: string) {
  const meta = ARCHETYPE_NAMES[archetypeId];
  drawGlassPanel(ctx, 86, 820, 908, 310, color);
  smallKicker(ctx, "Я ПРОЖИЛ НЕДЕЛЮ КАК", 540, 880, CYAN, "center");
  centerTitle(ctx, meta.en, 540, 958, 58, 820, color);
  bodyText(ctx, input.subtitle || meta.tagline, 540, 1032, 34, 760, 3, "center");
}

function drawSeasonResultCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 560, 760, 450, 360, color);
  smallKicker(ctx, "СЕЗОН ЗАВЕРШЁН", 785, 826, color, "center");
  centerTitle(ctx, input.rank != null ? `${input.rank} МЕСТО` : "ФИНАЛ", 785, 930, 58, 390, color);
  centerTitle(ctx, `${formatSigned(input.score ?? 0)} DAO`, 785, 1022, 64, 390, color);
  bodyText(ctx, input.subtitle ?? "Ты прошёл путь до пятницы. Время подвести итоги.", 785, 1082, 25, 360, 2, "center");
}

function drawWildMomentCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 70, 742, 940, 410, color);
  smallKicker(ctx, "САМЫЙ БЕЗУМНЫЙ МОМЕНТ НЕДЕЛИ", 110, 810, color);
  bigTitle(ctx, input.title ?? "РЫНОК ПРОВЕРИЛ ХАРАКТЕР", 110, 902, 48, 820);
  bodyText(ctx, input.description ?? "Главный сюжет недели оказался громче любого чата.", 112, 1006, 34, 780, 3);
  centerTitle(ctx, input.score != null && input.score >= 0 ? "И ЭТО СРАБОТАЛО" : "И ЭТО БЫЛО ЖЁСТКО", 540, 1114, 34, 860, input.score != null && input.score >= 0 ? GREEN : RED);
}

function drawStatsCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 70, 740, 940, 430, color);
  smallKicker(ctx, "ИТОГ ХАРАКТЕРИСТИК", 110, 810, color);
  const stats = input.stats;
  if (!stats) {
    bodyText(ctx, "Неделя изменила героя. Подробности скрыты в DAO.", 112, 900, 36, 780, 4);
    return;
  }
  const keys: Array<keyof StatsDTO> = ["bankroll", "discipline", "reputation", "alpha", "fomo", "stress"];
  keys.forEach((key, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 118 + col * 430;
    const y = 880 + row * 82;
    statBar(ctx, STAT_LABELS[key], stats[key], x, y, 350, STAT_COLORS[key]);
  });
  centerTitle(ctx, "РЫНОК НЕ СЛОМАЛ МЕНЯ", 540, 1130, 34, 860, color);
}

function drawNominationsCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 70, 734, 940, 440, color);
  smallKicker(ctx, "НОМИНАЦИИ DAO", 110, 804, color);
  const nominations = input.nominations?.length ? input.nominations.slice(0, 3) : [
    { title: "DAO МУДРЕЦ", reason: "Неделя оставила след в истории комнаты." },
  ];
  nominations.forEach((nomination, index) => {
    const y = 872 + index * 104;
    ctx.fillStyle = withAlpha(index === 0 ? GOLD : CYAN, 0.18);
    roundRect(ctx, 112, y - 42, 856, 78, 22);
    ctx.fill();
    ctx.strokeStyle = withAlpha(index === 0 ? GOLD : CYAN, 0.42);
    ctx.stroke();
    smallKicker(ctx, nomination.title, 150, y, index === 0 ? GOLD : CYAN);
    if (nomination.points != null) {
      ctx.font = "900 32px Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = nomination.points >= 0 ? GREEN : RED;
      ctx.fillText(formatSigned(nomination.points), 928, y);
    }
  });
}

function drawInviteCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 90, 780, 900, 360, color);
  centerTitle(ctx, input.title ?? "ЗОВИ В КОМНАТУ", 540, 872, 54, 820, GOLD);
  centerTitle(ctx, input.subtitle ?? "ПРИСОЕДИНЯЙСЯ К CRYPTO REALITY", 540, 960, 42, 820, CYAN);
  smallKicker(ctx, "КОД КОМНАТЫ", 540, 1042, color, "center");
  centerTitle(ctx, input.roomCode ?? "------", 540, 1112, 58, 820, color);
}

function drawDayFinalCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 88, 780, 904, 350, color);
  smallKicker(ctx, `ДЕНЬ ${input.dayNumber ?? "?"} ИЗ ${input.seasonLength ?? 7}`, 540, 846, CYAN, "center");
  centerTitle(ctx, input.title ?? dayTitle(input.score ?? 0), 540, 938, 58, 820, input.score != null && input.score < 0 ? RED : color);
  centerTitle(ctx, `${formatSigned(input.score ?? 0)} DAO`, 540, 1050, 76, 820, input.score != null && input.score < 0 ? RED : GREEN);
}

function drawChoiceCard(ctx: CanvasRenderingContext2D, input: ShareGameCardInput, color: string) {
  drawGlassPanel(ctx, 70, 646, 940, 500, color);
  smallKicker(ctx, "ФИНАЛ ВЫБОРА", 110, 720, color);
  bigTitle(ctx, input.eventTitle ?? "СИТУАЦИЯ ДНЯ", 110, 804, 42, 780);
  bodyText(ctx, input.choiceText ?? "Я сделал выбор в Crypto Reality.", 112, 890, 30, 780, 3);
  centerTitle(ctx, input.title ?? choiceTitle(input.score ?? 0), 540, 1020, 40, 820, input.score != null && input.score < 0 ? RED : GREEN);
  if (input.effects) {
    const entries = Object.entries(input.effects).slice(0, 3);
    entries.forEach(([key, delta], index) => {
      const x = 160 + index * 270;
      smallKicker(ctx, statLabel(key), x, 1094, CYAN, "center");
      centerTitle(ctx, formatSigned(delta), x, 1144, 34, 200, delta >= 0 ? GREEN : RED);
    });
  }
}

function drawGlassPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.save();
  ctx.shadowColor = withAlpha(color, 0.35);
  ctx.shadowBlur = 28;
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, "rgba(255,255,255,0.12)");
  g.addColorStop(0.2, withAlpha(color, 0.12));
  g.addColorStop(1, "rgba(0,0,2,0.68)");
  ctx.fillStyle = g;
  roundRect(ctx, x, y, w, h, 34);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = withAlpha(color, 0.62);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 26);
  ctx.stroke();
  ctx.restore();
}

function smallKicker(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.font = "800 25px Arial, sans-serif";
  ctx.letterSpacing = "3px";
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.shadowColor = withAlpha(color, 0.55);
  ctx.shadowBlur = 12;
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

function bigTitle(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, width: number) {
  ctx.save();
  ctx.textAlign = "left";
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255,255,255,0.35)";
  ctx.shadowBlur = 12;
  wrapText(ctx, text.toUpperCase(), x, y, width, size * 1.08, 3);
  ctx.restore();
}

function centerTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  width: number,
  color = "#ffffff"
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.shadowColor = withAlpha(color, 0.48);
  ctx.shadowBlur = 18;
  wrapText(ctx, text.toUpperCase(), x, y, width, size * 1.08, 2, "center");
  ctx.restore();
}

function bodyText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  width: number,
  maxLines: number,
  align: CanvasTextAlign = "left"
) {
  ctx.save();
  ctx.textAlign = align;
  ctx.font = `500 ${size}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  wrapText(ctx, text, x, y, width, size * 1.38, maxLines, align);
  ctx.restore();
}

function statBar(ctx: CanvasRenderingContext2D, label: string, value: number, x: number, y: number, w: number, color: string) {
  ctx.save();
  smallKicker(ctx, label, x, y, color);
  ctx.font = "900 38px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(value), x + w, y);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, x, y + 18, w, 14, 7);
  ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, x, y + 18, Math.max(10, Math.min(w, (value / 100) * w)), 14, 7);
  ctx.fill();
  ctx.restore();
}

function drawFooter(ctx: CanvasRenderingContext2D, footer: string, link: string) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "800 24px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.fillText(footer, CARD_W / 2, CARD_H - 72);
  ctx.font = "500 20px Arial, sans-serif";
  ctx.fillStyle = "rgba(0,229,255,0.72)";
  ctx.fillText(link, CARD_W / 2, CARD_H - 38);
  ctx.restore();
}

function shareTextFor(input: ShareGameCardInput): string {
  if (input.shareText) return appendLink(input.shareText, input.link ?? fallbackBotLink());

  const link = input.link ?? fallbackBotLink();
  const base = {
    season_title: "Мой финальный титул сезона в Crypto Reality.",
    season_archetype: "Кем я был в крипто-хаосе этой недели.",
    season_result: "Мой финальный результат сезона в Crypto Reality.",
    wild_moment: "Самый безумный момент моей недели в Crypto Reality.",
    stats_summary: "Итог моих характеристик после недели крипто-хаоса.",
    dao_nominations: "Мои DAO-номинации сезона.",
    invite: "Заходи в мою комнату Crypto Reality.",
    day_final: "Мой итог дня в Crypto Reality.",
    choice_final: "Мой выбор в Crypto Reality.",
  } satisfies Record<ShareGameCardKind, string>;

  return appendLink(base[input.kind], link);
}

function appendLink(text: string, link: string): string {
  return `${text}\n${link}`;
}

function backgroundFor(input: ShareGameCardInput, archetypeBackground: string): string {
  if (input.kind === "season_result") return finalBgFor(input.rankTone ?? rankToneFromRank(input.rank));
  if (input.kind === "invite") return "/assets/backgrounds/room_max.webp";
  if (input.kind === "wild_moment") return "/assets/backgrounds/room_max_9x19.webp";
  return archetypeBackground;
}

function finalBgFor(tone: ShareRankTone): string {
  if (tone === "first") return "/assets/backgrounds/final_first.PNG";
  if (tone === "second") return "/assets/backgrounds/final_second.PNG";
  if (tone === "third") return "/assets/backgrounds/final_third.PNG";
  return "/assets/backgrounds/final_all.PNG";
}

function rankToneFromRank(rank: number | undefined): ShareRankTone {
  if (rank === 1) return "first";
  if (rank === 2) return "second";
  if (rank === 3) return "third";
  return "all";
}

function rankColor(tone: ShareRankTone): string {
  if (tone === "first") return GOLD;
  if (tone === "second") return "#d6dde9";
  if (tone === "third") return "#cd7f32";
  return "#ffffff";
}

function dayTitle(delta: number): string {
  if (delta > 0) return "ТОЧНЫЙ ВХОД";
  if (delta === 0) return "НИЧЬЯ С РЫНКОМ";
  return "РЫНОК ПЕРЕИГРАЛ МЕНЯ";
}

function choiceTitle(delta: number): string {
  if (delta >= 0) return "РЕШЕНИЕ СРАБОТАЛО";
  return "ХАОС ЗАБРАЛ ОЧКИ";
}

function statLabel(key: string): string {
  return STAT_LABELS[key as keyof StatsDTO] ?? key.toUpperCase();
}

function formatSigned(value: number): string {
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return value > 0 ? `+${formatted}` : formatted;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  align: CanvasTextAlign = "left"
) {
  ctx.textAlign = align;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
      continue;
    }
    lines.push(current);
    current = word;
    if (lines.length >= maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  lines.forEach((line, index) => {
    const clipped = index === maxLines - 1 && words.join(" ").length > lines.join(" ").length
      ? `${line.replace(/[,.!?;:]*$/, "")}…`
      : line;
    ctx.fillText(clipped, x, y + index * lineHeight);
  });
}

function line(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawContainImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function canShareFile(file: File): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (typeof nav.canShare !== "function") return true;
  return nav.canShare({ files: [file] });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isArchetypeId(value: unknown): value is ArchetypeId {
  return typeof value === "string" && value in archetypeAssets;
}
