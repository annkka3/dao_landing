import noActiveGameIcon from "../../../../assets/icons/states/no-active-game.svg";
import { Button } from "../../../../shared/ui/Button/Button";
import { EmptyState } from "../../../../shared/ui/State/EmptyState";

export interface NoActiveGameStateProps {
  onCreateRoom?: () => void;
  onJoinRoom?: () => void;
}

export function NoActiveGameState({ onCreateRoom, onJoinRoom }: NoActiveGameStateProps) {
  return (
    <EmptyState
      action={
        <>
          <Button fullWidth onClick={onCreateRoom}>Создать комнату</Button>
          <Button fullWidth variant="secondary" onClick={onJoinRoom}>Присоединиться</Button>
        </>
      }
      icon={<img src={noActiveGameIcon} alt="" />}
      message="Ты не в активной игре. Создай комнату или присоединись к друзьям."
      title="Нет активной игры"
    />
  );
}
