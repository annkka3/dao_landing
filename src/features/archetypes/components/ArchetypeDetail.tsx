import type { CSSProperties, ReactNode } from "react";
import { Button } from "../../../shared/ui/Button/Button";
import { archetypeAssets, type ArchetypeId } from "../../../shared/assets/archetypeAssets";
import "./ArchetypeComponents.css";

export interface ArchetypeDetailProps {
  id: ArchetypeId;
  name: string;
  summary: ReactNode;
  traits: ReactNode[];
  accent?: string;
  selected?: boolean;
  actionLabel?: string;
  onSelect?: (id: ArchetypeId) => void;
}

export function ArchetypeDetail({
  id,
  name,
  summary,
  traits,
  accent = "var(--color-game-bonus)",
  selected = false,
  actionLabel = "Выбрать",
  onSelect,
}: ArchetypeDetailProps) {
  return (
    <section className="archetype-detail" style={{ "--archetype-accent": accent } as CSSProperties}>
      <img className="archetype-detail__hero" src={archetypeAssets[id].card.neutral} alt="" />
      <div className="archetype-detail__content">
        <h2>{name}</h2>
        <div className="archetype-detail__summary">{summary}</div>
        <ul className="archetype-detail__traits">
          {traits.map((trait, index) => (
            <li key={index}>{trait}</li>
          ))}
        </ul>
        <Button fullWidth state={selected ? "success" : "default"} variant={selected ? "primary" : "secondary"} onClick={() => onSelect?.(id)}>
          {selected ? "Выбран" : actionLabel}
        </Button>
      </div>
    </section>
  );
}
