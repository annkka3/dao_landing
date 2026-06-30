import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import "./Modal.css";

export interface ModalProps {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  footer?: ReactNode;
}

export function Modal({ open, title, children, icon, onClose, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-modal" role="presentation">
      <div className="ui-modal__scrim" />
      <section className="ui-modal__panel" role="dialog" aria-modal="true" aria-labelledby="ui-modal-title">
        {onClose && (
          <button className="ui-modal__close" type="button" aria-label="Закрыть окно" onClick={onClose}>
            x
          </button>
        )}
        {icon && <div className="ui-modal__icon">{icon}</div>}
        <h2 className="ui-modal__title" id="ui-modal-title">
          {title}
        </h2>
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </section>
    </div>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      icon={<span className={danger ? "ui-modal__icon-danger" : "ui-modal__icon-warning"} aria-hidden="true">!</span>}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}

export interface ErrorModalProps {
  open: boolean;
  title?: string;
  message: ReactNode;
  retryLabel?: string;
  backLabel?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorModal({
  open,
  title = "Ошибка сети",
  message,
  retryLabel = "Повторить",
  backLabel = "Назад",
  onRetry,
  onBack,
}: ErrorModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onBack}
      icon={<span className="ui-modal__icon-danger" aria-hidden="true">x</span>}
      footer={
        <>
          {onRetry && (
            <Button variant="danger" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              {backLabel}
            </Button>
          )}
        </>
      }
    >
      {message}
    </Modal>
  );
}
