# Journal / Risk Guardian

Runtime Risk Guardian frontend module for the existing Crypto Reality Telegram Mini App.

The app uses `FlowStep` navigation, not browser URL routing. Journal steps are wired in
`apps/miniapp/src/App.tsx` and `apps/miniapp/src/store/AppContext.tsx`.

Real backend integrations:
- `GET /journal/profile`
- `POST /journal/profile`
- `GET /journal/archetype-recommendations/{archetype_slug}`
- `POST /journal/trades/risk-check`
- `GET /journal/trades`
- `GET /journal/trades/{trade_id}`
- `POST /journal/trades`
- `POST /journal/trades/{trade_id}/checklist`
- `POST /journal/trades/{trade_id}/skip`
- `GET /journal/overview`
- `GET /journal/analytics?period=7d|30d`

Trade journal list and trade detail render real backend data and intentionally exclude
private notes, idempotency keys, ledger IDs, fraud metadata, suspicious flag IDs, and
raw event metadata.
