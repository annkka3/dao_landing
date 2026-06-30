import type { ReactNode } from "react";
import { Button } from "../../../../shared/ui/Button/Button";
import { Card } from "../../../../shared/ui/Card/Card";
import "./CurrentEventPreview.css";

export interface CurrentEventPreviewProps {
  title: string;
  timer: string;
  description: ReactNode;
  onOpen?: () => void;
}

export function CurrentEventPreview({ title, timer, description, onOpen }: CurrentEventPreviewProps) {
  return (
    <Card className="current-event-preview" title="Текущее окно" variant="elevated">
      <div className="current-event-preview__timer text-number">{timer}</div>
      <h3>{title}</h3>
      <div className="current-event-preview__description">{description}</div>
      <Button fullWidth variant="secondary" onClick={onOpen}>
        Перейти к событию
      </Button>
    </Card>
  );
}
