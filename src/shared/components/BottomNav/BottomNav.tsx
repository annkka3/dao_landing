import type { ReactNode } from "react";
import { useI18n } from "../../i18n";
import "./BottomNav.css";

export type NavTab = "lobby" | "events" | "play" | "market" | "profile";

export interface BottomNavProps {
  active: NavTab;
  onLobby?: () => void;
  onEvents?: () => void;
  onPlay?: () => void;
  onMarket?: () => void;
  onProfile?: () => void;
}

export function BottomNav({ active, onLobby, onEvents, onPlay, onMarket, onProfile }: BottomNavProps) {
  const { t } = useI18n();
  return (
    <nav className="bn">
      <NavBtn label={t("nav.lobby")}   tab="lobby"   active={active} onClick={onLobby}>   <HomeIcon size={22} />       </NavBtn>
      <NavBtn label={t("nav.events")}  tab="events"  active={active} onClick={onEvents}>  <CalendarIcon size={22} />   </NavBtn>
      <NavBtn label={t("nav.play")}    tab="play"    active={active} onClick={onPlay} isCenter> <CubeIcon size={22} /> </NavBtn>
      <NavBtn label={t("nav.market")}  tab="market"  active={active} onClick={onMarket}>  <MarketIcon size={22} />     </NavBtn>
      <NavBtn label={t("nav.profile")} tab="profile" active={active} onClick={onProfile}> <UserCircleIcon size={22} /> </NavBtn>
    </nav>
  );
}

function NavBtn({
  label, tab, active, onClick, children, isCenter,
}: {
  label: string; tab: NavTab; active: NavTab; onClick?: () => void; children: ReactNode; isCenter?: boolean;
}) {
  const isActive = tab === active;
  return (
    <button
      type="button"
      className={`bn__btn${isActive ? " bn__btn--active" : ""}${isCenter ? " bn__btn--center" : ""}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="bn__icon">{children}</span>
      <span className="bn__label">{label}</span>
    </button>
  );
}

function HomeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 21v-8h6v8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 2v4M8 2v4M3 9h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 14l-3.5 3.5L12 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CubeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 22V12" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.55" />
      <path d="M3 7L12 12L21 7" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.55" />
    </svg>
  );
}

function MarketIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 9.5h11l-.8 9.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8l-.8-9.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 9.5V7a3 3 0 0 1 6 0v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 14h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UserCircleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.5 19.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
