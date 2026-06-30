export function MarketEmptyState({
  title = "Пока пусто",
  message = "Здесь появятся предметы DAO Market.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="dm__empty">
      <span className="dm__empty-icon">◇</span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
