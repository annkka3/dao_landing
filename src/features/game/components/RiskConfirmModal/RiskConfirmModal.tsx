import { ConfirmModal } from "../../../../shared/ui/Modal/ConfirmModal";

export interface RiskConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RiskConfirmModal({ open, onConfirm, onCancel }: RiskConfirmModalProps) {
  return (
    <ConfirmModal
      danger
      cancelLabel="Отмена"
      confirmLabel="Подтвердить"
      message="Этот выбор может повысить стресс и уменьшить запас выживания. Подтвердить игровое действие?"
      open={open}
      title="Предупреждение о риске"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
