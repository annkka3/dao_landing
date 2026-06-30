import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "s" | "m";
export type ButtonState = "default" | "pressed" | "success" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  state?: ButtonState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "m",
  fullWidth = false,
  loading = false,
  state = "default",
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cx(
        "ui-button",
        `ui-button--${variant}`,
        `ui-button--${size}`,
        `ui-button--${state}`,
        fullWidth && "ui-button--full",
        loading && "ui-button--loading",
        className,
      )}
      disabled={isDisabled}
      type={type}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="ui-button__spinner" aria-hidden="true" /> : leftIcon}
      <span className="ui-button__label">{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
