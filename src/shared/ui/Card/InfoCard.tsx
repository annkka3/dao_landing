import type { ReactNode } from "react";
import { Card } from "./Card";
import "./Card.css";

export interface InfoCardProps {
  title: ReactNode;
  value?: ReactNode;
  caption?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  children?: ReactNode;
}

export function InfoCard({ title, value, caption, tone = "default", children }: InfoCardProps) {
  return (
    <Card variant="basic" className={`ui-info-card ui-info-card--${tone}`}>
      <div className="ui-info-card__title">{title}</div>
      {value && <div className="ui-info-card__value text-number">{value}</div>}
      {caption && <div className="ui-info-card__caption">{caption}</div>}
      {children}
    </Card>
  );
}
