import { MARKET_TABS, type MarketTabKey } from "../constants";

export function MarketCategoryTabs({
  active,
  onChange,
}: {
  active: MarketTabKey;
  onChange: (tab: MarketTabKey) => void;
}) {
  return (
    <div className="dm__tabs" role="tablist" aria-label="Категории DAO Market">
      {MARKET_TABS.map((tab) => (
        <button
          key={tab.key}
          className={`dm__tab${active === tab.key ? " dm__tab--active" : ""}`}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
