export function MarketErrorState({
  message = "Не удалось загрузить DAO Market.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="dm__empty dm__empty--error">
      <span className="dm__empty-icon">!</span>
      <strong>Что-то пошло не так</strong>
      <p>{message}</p>
      {onRetry && (
        <button className="dm__ghost-btn" type="button" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
