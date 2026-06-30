# Quality Checklist

## Responsive Screens

- Check `360x800`, `390x844`, and `430x932`.
- No horizontal scrolling.
- Sticky bottom actions fit above safe area.
- Text does not overlap cards, buttons, art, or status rows.
- Main actions remain reachable with one hand.

## Accessibility

- Tap targets are at least `44x44`.
- Text contrast meets AA on dark backgrounds.
- Disabled and locked states are visually distinct.
- Loading states expose `aria-busy` or `role="status"` where relevant.
- Decorative images use empty alt text.

## Assets

- Runtime raster images use WebP.
- Archive/source images use PNG.
- Transparent cutouts preserve alpha.
- Avatar faces remain readable at `40x40`.
- No stretched art.
- No real exchange, crypto project, or influencer logos.

## Components

- Button states: default, pressed, disabled, loading, success, danger.
- Choice states: default, selected, submitted, disabled, dangerous, bonus, locked.
- Event states: available, completed, missed, locked, urgent.
- Modal states: confirmation, disclaimer, error, risk warning.
- Leaderboard rows: regular, current user, rekt/DNF, loading, empty.

## Content

- Russian text is understandable and game-first.
- All financial-looking copy is framed as fictional game outcome.
- No banned trading words from `content-rules.md`.
- Share cards are understandable without app context.
