# Screen States

Reference screens live in `apps/miniapp/docs/design-reference/screens/`.

| State | Route / Screen | Primary UI | Notes |
| --- | --- | --- | --- |
| loading | any route | `FullScreenLoading`, `CardSkeleton` | Use while user/session/game data is unknown. |
| no active game | `/home` | `NoActiveGameState` | Show create/join actions. |
| lobby | `/lobby` | `LobbyPage`, `InviteCodeCard`, participant rows | Waiting room before game starts. |
| active morning | `/game` | `GameDashboardPage`, `TodayEventsPanel` | Morning event available. |
| active day | `/game` | `GameDashboardPage`, `CurrentEventPreview` | Day event available. |
| evening locked | `/game` | `TodayEventsPanel`, disabled event card | Evening is visible but locked until requirements are met. |
| evening available | `/event/current` | `CurrentEventPage`, `EventCard`, `ChoiceList` | Bonus/evening window can be opened. |
| all completed | `/game` | `DayProgress`, completed chips | All events for the day completed; show recap CTA. |
| missed event | `/event/result` or `/game` | `ChoiceResultCard` with `missed` tone | User missed the event window. |
| season finished | `/final-result` | `FinalResultPage`, `FinalResultCard` | Season summary and sharing actions. |
| error | any route | `ErrorState`, `ErrorModal` | Provide retry/back action when possible. |

## Route Matrix

| Route | Normal | Empty | Loading | Error |
| --- | --- | --- | --- | --- |
| `/welcome` | welcome + disclaimer | n/a | boot loader | network/session error |
| `/home` | current game | no active game | current game skeleton | retry state |
| `/rooms` | create/join forms | n/a | form submit loading | invalid code |
| `/lobby` | participants + invite code | no participants | lobby skeleton | room not found |
| `/archetypes` | grid + detail | no archetypes | card skeletons | cannot change |
| `/game` | dashboard | no active game | dashboard skeleton | game state error |
| `/event/current` | event + choices | event expired | submitting | risk/error modal |
| `/event/result` | result card | missed result | result loading | retry state |
| `/leaderboard` | leaderboard table | leaderboard empty | row skeletons | retry state |
| `/final-result` | final result | season cancelled | result loading | retry state |
