import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ChoiceButton.css";

export type ChoiceState = "default" | "selected" | "submitted" | "disabled" | "dangerous" | "bonus" | "locked";

export interface ChoiceButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  state?: ChoiceState;
  compact?: boolean;
  icon?: ReactNode;
}

export function ChoiceButton({
  title,
  description,
  meta,
  state = "default",
  compact = false,
  icon,
  disabled,
  className,
  type = "button",
  ...props
}: ChoiceButtonProps) {
  const isDisabled = disabled || state === "disabled" || state === "locked" || state === "submitted";

  return (
    <button
      className={[
        "game-choice-button",
        `game-choice-button--${state}`,
        compact && "game-choice-button--compact",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
      type={type}
      {...props}
    >
      {icon && <span className="game-choice-button__icon">{icon}</span>}
      <span className="game-choice-button__content">
        <span className="game-choice-button__title">{title}</span>
        {description && <span className="game-choice-button__description">{description}</span>}
      </span>
      {meta && <span className="game-choice-button__meta">{meta}</span>}
    </button>
  );
}
