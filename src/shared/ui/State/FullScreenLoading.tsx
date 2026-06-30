import "./State.css";

export interface FullScreenLoadingProps {
  label?: string;
}

export function FullScreenLoading({ label = "Загружаем игру..." }: FullScreenLoadingProps) {
  return (
    <div className="ui-fullscreen-loading" role="status" aria-live="polite">
      <span className="ui-fullscreen-loading__ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
