import { Button } from "../../../shared/ui/Button/Button";
import { Modal } from "../../../shared/ui/Modal/Modal";
import "./DisclaimerModal.css";

export interface DisclaimerModalProps {
  open: boolean;
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onAccept: () => void;
  onDecline?: () => void;
}

export function DisclaimerModal({ open, accepted, onAcceptedChange, onAccept, onDecline }: DisclaimerModalProps) {
  return (
    <Modal
      open={open}
      title="Важно"
      icon={<span className="disclaimer-modal__warning" aria-hidden="true">!</span>}
      footer={
        <>
          {onDecline && (
            <Button variant="secondary" onClick={onDecline}>
              Не согласен
            </Button>
          )}
          <Button variant="primary" disabled={!accepted} onClick={onAccept}>
            Принять
          </Button>
        </>
      }
    >
      <div className="disclaimer-modal">
        <p>Crypto Reality - развлекательная игра. События и активы вымышлены и не являются финансовой рекомендацией.</p>
        <label className="disclaimer-modal__check">
          <input checked={accepted} type="checkbox" onChange={(event) => onAcceptedChange(event.currentTarget.checked)} />
          <span>Я принимаю правила игры</span>
        </label>
      </div>
    </Modal>
  );
}
