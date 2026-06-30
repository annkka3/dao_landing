import { Button } from "../../../../shared/ui/Button/Button";

export interface ShareResultButtonProps {
  onShare?: () => void;
}

export function ShareResultButton({ onShare }: ShareResultButtonProps) {
  return (
    <Button fullWidth variant="secondary" onClick={onShare}>
      Поделиться результатом
    </Button>
  );
}
