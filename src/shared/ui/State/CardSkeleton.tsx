import "./State.css";

export interface CardSkeletonProps {
  rows?: number;
}

export function CardSkeleton({ rows = 3 }: CardSkeletonProps) {
  return (
    <div className="ui-card-skeleton" aria-hidden="true">
      <span className="ui-card-skeleton__avatar" />
      <div className="ui-card-skeleton__content">
        {Array.from({ length: rows }, (_, index) => (
          <span className="ui-card-skeleton__line" key={index} />
        ))}
      </div>
    </div>
  );
}
