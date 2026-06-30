export const shareTemplates = {
  dailyResult: {
    win: "/assets/share-templates/daily-result/win-1080x1080.webp",
    mixed: "/assets/share-templates/daily-result/mixed-1080x1080.webp",
    rekt: "/assets/share-templates/daily-result/rekt-1080x1080.webp",
    missed: "/assets/share-templates/daily-result/missed-1080x1080.webp",
    vertical: {
      win: "/assets/share-templates/daily-result/win-1080x1920.webp",
    },
  },
  nomination: {
    degenDay: "/assets/share-templates/nomination/degen-day-1080x1080.webp",
    hodlCalm: "/assets/share-templates/nomination/hodl-calm-1080x1080.webp",
    panicPlayer: "/assets/share-templates/nomination/panic-player-1080x1080.webp",
    moonProphetRight: "/assets/share-templates/nomination/moon-prophet-right-1080x1080.webp",
    doomerWarned: "/assets/share-templates/nomination/doomer-warned-1080x1080.webp",
  },
  finalRank: {
    top3: "/assets/share-templates/final-rank/top3-1080x1080.webp",
    top10: "/assets/share-templates/final-rank/top10-1080x1080.webp",
    survived: "/assets/share-templates/final-rank/survived-1080x1080.webp",
    rekt: "/assets/share-templates/final-rank/rekt-1080x1080.webp",
    dnf: "/assets/share-templates/final-rank/dnf-1080x1080.webp",
    vertical: {
      top3: "/assets/share-templates/final-rank/top3-1080x1920.webp",
      rekt: "/assets/share-templates/final-rank/rekt-1080x1920.webp",
    },
    og: {
      top3: "/assets/share-templates/final-rank/top3-1200x630.webp",
    },
  },
  rekt: {
    square: "/assets/share-templates/rekt/rekt-1080x1080.webp",
    vertical: "/assets/share-templates/rekt/rekt-1080x1920.webp",
    og: "/assets/share-templates/rekt/rekt-1200x630.webp",
  },
  invite: {
    square: "/assets/share-templates/invite/invite-1080x1080.webp",
    vertical: "/assets/share-templates/invite/invite-1080x1920.webp",
    og: "/assets/share-templates/invite/invite-1200x630.webp",
    telegram: "/assets/share-templates/invite/invite-1600x900.webp",
  },
} as const;

export type ShareTemplates = typeof shareTemplates;
