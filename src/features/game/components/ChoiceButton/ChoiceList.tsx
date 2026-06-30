import { ChoiceButton, type ChoiceButtonProps } from "./ChoiceButton";
import "./ChoiceButton.css";

export interface ChoiceListProps {
  choices: Array<ChoiceButtonProps & { id: string }>;
}

export function ChoiceList({ choices }: ChoiceListProps) {
  return (
    <div className="game-choice-list">
      {choices.map((choice) => (
        <ChoiceButton key={choice.id} {...choice} />
      ))}
    </div>
  );
}
