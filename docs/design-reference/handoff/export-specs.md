# Export Specs

## Design Tokens

| Format | Path |
| --- | --- |
| CSS variables | `apps/miniapp/src/shared/styles/tokens.css` |
| TypeScript theme | `apps/miniapp/src/shared/styles/theme.ts` |
| JSON tokens | `apps/miniapp/docs/design-reference/handoff/tokens.json` |

## Archetypes

| Asset | Runtime | Archive |
| --- | --- | --- |
| Avatar | `apps/miniapp/public/assets/archetypes/{id}/avatar/avatar-{64,128,256}.webp` | `assets/archetypes/{id}/avatar/avatar-512.png` |
| Card art | `apps/miniapp/public/assets/archetypes/{id}/card/{neutral,win,rekt}-768x1024.webp` | source PNG/WebP under `assets/archetypes/{id}/card/` |
| Hero art | `apps/miniapp/public/assets/archetypes/{id}/hero/{neutral,win,rekt}-1024.webp` | `assets/archetypes/{id}/hero/*_2048.png` |
| Cutout | `apps/miniapp/public/assets/archetypes/{id}/cutout/{neutral,win,rekt}.webp` | `assets/archetypes/{id}/cutout/{neutral,win,rekt}-transparent.png` |

## Share Cards

| Template | Runtime | Source |
| --- | --- | --- |
| Daily result | `apps/miniapp/public/assets/share-templates/daily-result/*.webp` | `assets/share_cards/source/daily-result/*.png` |
| Nomination | `apps/miniapp/public/assets/share-templates/nomination/*.webp` | `assets/share_cards/source/nomination/*.png` |
| Final rank | `apps/miniapp/public/assets/share-templates/final-rank/*.webp` | `assets/share_cards/source/final-rank/*.png` |
| Rekt | `apps/miniapp/public/assets/share-templates/rekt/*.webp` | `assets/share_cards/source/rekt/*.png` |
| Invite | `apps/miniapp/public/assets/share-templates/invite/*.webp` | `assets/share_cards/source/invite/*.png` |

## UI Icons

- Primary UI icons: SVG `24x24`.
- Compact icons: render the same SVG at `16x16` or `20x20`.
- Empty state icons: SVG `64x64`.
- Keep strokes centered and generally `1.6-2px`.

## Manifests

- Archetypes: `apps/miniapp/src/shared/assets/archetypeAssets.ts`
- Share cards: `apps/miniapp/src/shared/assets/shareTemplates.ts`
