import { Button } from "../../../../shared/ui/Button/Button";

export interface ShareFinalResultProps {
  onShare?: () => void;
}

export function ShareFinalResult({ onShare }: ShareFinalResultProps) {
  return (
    <Button fullWidth variant="secondary" onClick={onShare}>
      Поделиться итогом
    </Button>
  );
}
