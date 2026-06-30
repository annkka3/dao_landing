export const colors = {
  background: {
    primary: "#0B0F14",
    secondary: "#11161F",
    tertiary: "#151B25",
  },
  surface: {
    card: "#161C27",
    elevated: "#1E2431",
    input: "#121823",
    overlay: "#0B0F14CC",
  },
  text: {
    primary: "#F5F7FA",
    secondary: "#B8BCC9",
    muted: "#7A8596",
    disabled: "#4E5768",
    inverse: "#0B0F14",
  },
  border: {
    default: "#242A36",
    strong: "#3C3C4D",
    divider: "#1F2633",
  },
  overlay: {
    scrim: "#0B0F14CC",
    modal: "#0B0F14E6",
  },
  line: {
    focus: "#3A8CFF",
  },
  link: "#4EA1FF",
  state: {
    success: "#22C55E",
    successDark: "#16A34A",
    warning: "#F59E0B",
    warningDark: "#B45309",
    danger: "#EF4444",
    dangerDark: "#B91C1C",
    info: "#3882F6",
    neutral: "#64748B",
  },
  game: {
    fomo: "#FF2ED6",
    rekt: "#FF3B30",
    bonus: "#00E5FF",
    rare: "#A855F7",
    legendary: "#FFD23F",
    locked: "#384252",
    disabled: "#2A303C",
  },
  stats: {
    bankroll: "#22C55E",
    reputation: "#3882F6",
    stress: "#EF4444",
    fomo: "#FF2ED6",
    risk: "#F59E0B",
    discipline: "#00E5FF",
    degenIndex: "#A855F7",
  },
  archetypeAccents: {
    riskManager: "#3A8CFF",
    memeDegen: "#39FF14",
    onchainDetective: "#00D4FF",
    leverageCowboy: "#FFBA00",
    hodlMonk: "#FFD23F",
    airdropFarmer: "#22E6B3",
    moonProphet: "#B84DFF",
    capitulationDoomer: "#FF3B30",
  },
  fx: {
    glowSuccess: "#22C55E",
    glowWarning: "#F59E0B",
    glowDanger: "#EF4444",
    glowBonus: "#00E5FF",
    glowPurple: "#A855F7",
  },
} as const;

export const spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
  80: 80,
} as const;

export const radius = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 999,
} as const;

export const shadows = {
  card: "0 4px 16px rgba(0, 0, 0, 0.35)",
  modal: "0 20px 60px rgba(0, 0, 0, 0.6)",
  elevated: "0 8px 24px rgba(0, 0, 0, 0.45)",
  button: "0 4px 12px rgba(0, 0, 0, 0.3)",
} as const;

export const glows = {
  active: "0 0 2px rgba(58, 140, 255, 0.25), 0 0 16px rgba(58, 140, 255, 0.45)",
  warning: "0 0 2px rgba(245, 158, 11, 0.25), 0 0 16px rgba(245, 158, 11, 0.45)",
  danger: "0 0 2px rgba(239, 68, 68, 0.25), 0 0 16px rgba(239, 68, 68, 0.45)",
  result: "0 0 24px rgba(0, 229, 255, 0.6)",
} as const;

export const overlays = {
  disabled: "rgba(11, 15, 20, 0.6)",
  readonly: "rgba(255, 255, 255, 0.04)",
} as const;

export const layout = {
  baseFrame: {
    width: 390,
    height: 844,
  },
  compactCheck: {
    width: 360,
    height: 800,
  },
  largeCheck: {
    width: 430,
    height: 932,
  },
  safePadding: 16,
  safePaddingCompact: 12,
  edgeGutter: 16,
  edgeGutterCompact: 12,
  headerHeight: 56,
  headerHeightCompact: 52,
  bottomNavHeight: 64,
  bottomStickyHeight: 72,
  bottomStickyHeightCompact: 64,
  tabBarHeight: 56,
  cardMinHeight: 104,
  cardPadding: 16,
  cardGap: 12,
  modalMaxWidth: 358,
  modalPadding: 20,
  sectionGap: 24,
  listGap: 12,
  touchTargetMin: 44,
} as const;

export const typography = {
  display: {
    fontFamily: 'Orbitron, "Exo 2", "Avenir Next Condensed", "Arial Black", Impact, system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: 'Orbitron, "Exo 2", "Avenir Next Condensed", "Arial Black", Impact, system-ui, sans-serif',
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 400,
    letterSpacing: 0,
  },
  numeric: {
    fontFamily: 'Inter, Orbitron, "Avenir Next Condensed", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontVariantNumeric: "tabular-nums",
  },
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  glows,
  overlays,
  layout,
  typography,
} as const;

export type Theme = typeof theme;
