# Component States

Reference: `component-states.png`.

## Button

Implementation: `apps/miniapp/src/shared/ui/Button/Button.tsx`

- `variant`: `primary`, `secondary`, `ghost`, `danger`
- `size`: `m`, `s`
- `state`: `default`, `pressed`, `success`, `danger`
- boolean props: `disabled`, `loading`, `fullWidth`
- required states: default, pressed, disabled, loading, success, danger
- touch target: never below `--touch-target-min` (`44px`)

## EventCard

Implementation: `apps/miniapp/src/features/game/components/EventCard/EventCard.tsx`

- `state`: `available`, `completed`, `missed`, `locked`, `urgent`
- `timeTone`: `morning`, `day`, `eveningBonus`
- visual status is driven by `--event-accent`
- event icons live in `apps/miniapp/src/assets/icons/game/`

## ChoiceButton

Implementation: `apps/miniapp/src/features/game/components/ChoiceButton/ChoiceButton.tsx`

- `state`: `default`, `selected`, `submitted`, `disabled`, `dangerous`, `bonus`, `locked`
- `compact`: enables compact 44px-safe row
- disabled states: `disabled`, `locked`, `submitted`
- text must use game-first wording, not trading instructions

## StatBar / StatPill

Implementation: `apps/miniapp/src/shared/ui/StatBar/`

- `tone`: `bankroll`, `reputation`, `stress`, `fomo`, `risk`, `discipline`, `degenIndex`
- `value` and `max` calculate bar progress
- `hidden` reduces opacity for locked/hidden stats
- stat colors come from `--color-stat-*`

## Modal

Implementation: `apps/miniapp/src/shared/ui/Modal/`

- base component: `Modal`
- specialized types: `ConfirmModal`, `ErrorModal`, `DisclaimerModal`, `RiskConfirmModal`
- modal max width: `--layout-modal-max-width`
- modal buttons should remain 44-48px tall
- use `danger` confirm style only for high-risk game consequences

## LeaderboardRow

Implementation: `apps/miniapp/src/features/leaderboard/components/LeaderboardRow.tsx`

- boolean props: `currentUser`, `rekt`, `loading`
- `accent` sets archetype or rank color
- avatar visible size: 36-48px
- row height target: 56-72px
