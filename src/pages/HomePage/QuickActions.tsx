import { Button } from "../../shared/ui/Button/Button";
import "./HomePage.css";

export interface QuickActionsProps {
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
  onResults?: () => void;
}

export function QuickActions({ onCreateRoom, onJoinRoom, onResults }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <Button variant="secondary" onClick={onCreateRoom}>
        Создать комнату
      </Button>
      <Button variant="secondary" onClick={onJoinRoom}>
        Присоединиться
      </Button>
      <Button variant="ghost" onClick={onResults}>
        Мои результаты
      </Button>
    </div>
  );
}
