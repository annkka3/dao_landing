# Asset Usage Rules

## Archetype Art

- Hero art: use for promo, final result, high-impact season screens.
- Card art: use for archetype selection and result cards.
- Avatar: use for profile, leaderboard, lobby, compact participant rows.
- Cutout: use for final cards, choice result cards, share cards, and celebratory screens.

## Cropping And Scale

- Do not stretch art. Preserve aspect ratio.
- Do not crop faces, eyes, hands, or key props.
- Keep a safe area of 8-12% around faces and important silhouettes.
- Keep minimum avatar readability at `40x40`.
- Use `object-fit: cover` only for avatars/card thumbnails where face-safe crop is verified.
- Use `object-fit: contain` for cutouts and final/result hero areas.

## Runtime Formats

- App runtime: WebP.
- Archive/source: PNG.
- Transparent character assets: WebP/PNG with alpha.
- Icons: SVG, centered on a 24x24 viewBox unless a 64x64 empty-state icon is required.

## Do Not

- Do not use real exchange logos.
- Do not use real crypto project logos.
- Do not use real influencer photos or names.
- Do not bake dynamic text into share backgrounds when runtime data will be overlaid.
