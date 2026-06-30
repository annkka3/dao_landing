import type { MarketItem } from "../types";
import { CATEGORY_LABELS, RARITY_LABELS, formatSparks, getEquippableSlot } from "../constants";

export function MarketItemCard({
  item,
  owned,
  equipped,
  onOpen,
}: {
  item: MarketItem;
  owned?: boolean;
  equipped?: boolean;
  onOpen: (item: MarketItem) => void;
}) {
  const slot = getEquippableSlot(item);
  const soldOut = item.status === "sold_out";
  return (
    <button
      type="button"
      className={`dm__item-card dm__item-card--${item.rarity} dm__item-card--${item.category}${soldOut ? " dm__item-card--sold" : ""}`}
      onClick={() => onOpen(item)}
    >
      <div className="dm__item-media">
        {item.preview_asset_url || item.asset_url ? (
          <img src={item.preview_asset_url ?? item.asset_url ?? ""} alt="" />
        ) : (
          <span>{categoryGlyph(item.category)}</span>
        )}
        {equipped && <span className="dm__item-equipped">НАДЕТО</span>}
        {owned && !equipped && <span className="dm__item-owned">ЕСТЬ</span>}
      </div>
      <div className="dm__item-body">
        <div className="dm__item-row">
          <span className="dm__item-category">{CATEGORY_LABELS[item.category]}</span>
          <span className="dm__item-rarity">{RARITY_LABELS[item.rarity]}</span>
        </div>
        <strong>{item.title}</strong>
        <p>{item.description}</p>
        <div className="dm__item-footer">
          <span className="dm__price">{item.price_sparks == null ? "Недоступно" : `${formatSparks(item.price_sparks)} ✦`}</span>
          <span className="dm__slot">{slot ? "Можно надеть" : soldOut ? "Sold out" : "Коллекция"}</span>
        </div>
      </div>
    </button>
  );
}

function categoryGlyph(category: MarketItem["category"]): string {
  if (category === "profile_frame") return "⬡";
  if (category === "share_card_template") return "▣";
  if (category === "room_theme") return "◈";
  if (category === "character_skin") return "◍";
  if (category === "meme_item" || category === "meme_skin") return "✧";
  if (category === "education_pack") return "⌁";
  if (category === "access_pass") return "◇";
  return "◆";
}
