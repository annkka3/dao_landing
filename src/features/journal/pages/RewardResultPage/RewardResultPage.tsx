import { Button } from "../../../../shared/ui/Button/Button";
import type { RewardInfo } from "../../types";
import { JournalEmptyState, JournalPageShell, RewardResultCard } from "../../components/JournalComponents";

export function RewardResultPage({
  reward,
  onBack,
  onOverview,
}: {
  reward: RewardInfo | null;
  onBack?: () => void;
  onOverview?: () => void;
}) {
  return (
    <JournalPageShell title="Reward Result" subtitle="Итог записанного действия." onBack={onBack}>
      {reward ? (
        <>
          <RewardResultCard reward={reward} />
          <Button variant="secondary" onClick={onOverview}>К обзору</Button>
        </>
      ) : (
        <JournalEmptyState
          title="Результата пока нет"
          message="Reward появится после чеклиста или no-trade действия."
          action={<Button variant="secondary" onClick={onOverview}>К обзору</Button>}
        />
      )}
    </JournalPageShell>
  );
}
