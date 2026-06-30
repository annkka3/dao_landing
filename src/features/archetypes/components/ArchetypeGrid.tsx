import { ArchetypeCard, type ArchetypeCardProps } from "./ArchetypeCard";
import "./ArchetypeComponents.css";

export interface ArchetypeGridProps {
  items: ArchetypeCardProps[];
}

export function ArchetypeGrid({ items }: ArchetypeGridProps) {
  return (
    <div className="archetype-grid">
      {items.map((item) => (
        <ArchetypeCard key={item.id} {...item} />
      ))}
    </div>
  );
}
