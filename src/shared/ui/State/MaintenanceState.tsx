import maintenanceIcon from "../../../assets/icons/states/maintenance.svg";
import { EmptyState } from "./EmptyState";

export interface MaintenanceStateProps {
  retryAt?: string;
}

export function MaintenanceState({ retryAt = "00:25:34" }: MaintenanceStateProps) {
  return (
    <EmptyState
      icon={<img src={maintenanceIcon} alt="" />}
      message={`Мы улучшаем игру. Возвращайся через ${retryAt}.`}
      title="Технические работы"
    />
  );
}
