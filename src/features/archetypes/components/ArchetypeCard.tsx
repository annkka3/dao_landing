import type { CSSProperties, ReactNode } from "react";
import { archetypeAssets, type ArchetypeId } from "../../../shared/assets/archetypeAssets";
import "./ArchetypeComponents.css";

export interface ArchetypeCardProps {
  id: ArchetypeId;
  name: string;
  description: string;
  accent?: string;
  selected?: boolean;
  locked?: boolean;
  unavailableLabel?: ReactNode;
  onSelect?: (id: ArchetypeId) => void;
}

export function ArchetypeCard({
  id,
  name,
  description,
  accent = "var(--color-game-bonus)",
  selected = false,
  locked = false,
  unavailableLabel = "Soon",
  onSelect,
}: ArchetypeCardProps) {
  return (
    <button
      className={[
        "archetype-card",
        selected && "archetype-card--selected",
        locked && "archetype-card--locked",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={locked}
      onClick={() => onSelect?.(id)}
      style={{ "--archetype-accent": accent } as CSSProperties}
      type="button"
    >
      <img className="archetype-card__avatar" src={archetypeAssets[id].avatar.lg} alt="" />
      <span className="archetype-card__badge" aria-hidden="true" />
      <span className="archetype-card__content">
        <span className="archetype-card__name">{name}</span>
        <span className="archetype-card__description">{description}</span>
      </span>
      {locked && <span className="archetype-card__lock">{unavailableLabel}</span>}
    </button>
  );
}
