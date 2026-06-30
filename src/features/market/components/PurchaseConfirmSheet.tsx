import type { MarketItem } from "../types";
import { formatSparks } from "../constants";

export function PurchaseConfirmSheet({
  item,
  previewAvatarUrl,
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  item: MarketItem | null;
  previewAvatarUrl?: string | null;
  isPending?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!item) return null;

  const frameUrl = item.category === "profile_frame" ? item.asset_url ?? item.preview_asset_url : null;
  const roomThemeUrl = item.category === "room_theme" ? item.preview_asset_url ?? item.asset_url : null;

  return (
    <div className="dm__overlay" role="dialog" aria-modal="true">
      <div className="dm__sheet dm__sheet--compact">
        <button className="dm__close" type="button" onClick={onCancel}>×</button>
        <span className="dm__eyebrow">ПОДТВЕРЖДЕНИЕ</span>
        <h2>Купить предмет?</h2>
        {frameUrl && (
          <div className="dm__purchase-preview" aria-label="Предпросмотр рамки">
            <div className="dm__purchase-preview-avatar">
              {previewAvatarUrl ? <img src={previewAvatarUrl} alt="" /> : <span>CR</span>}
            </div>
            <img className="dm__purchase-preview-frame" src={frameUrl} alt="" />
          </div>
        )}
        {roomThemeUrl && (
          <div className="dm__theme-purchase-preview" aria-label="Предпросмотр темы комнаты">
            <img className="dm__theme-purchase-preview-bg" src={roomThemeUrl} alt="" />
            <div className="dm__theme-purchase-preview-overlay" />
            <div className="dm__theme-purchase-preview-orb">CR</div>
            <div className="dm__theme-purchase-preview-card">
              <span>ROOM THEME</span>
              <strong>{item.title}</strong>
            </div>
          </div>
        )}
        <p className="dm__sheet-text">
          {item.title} будет добавлен в твой инвентарь. Списание Искр необратимо.
        </p>
        <div className="dm__confirm-price">
          <span>Цена</span>
          <strong>{formatSparks(item.price_sparks)} ✦</strong>
        </div>
        {errorMessage && <p className="dm__form-error">{errorMessage}</p>}
        <div className="dm__sheet-actions">
          <button className="dm__ghost-btn" type="button" onClick={onCancel} disabled={isPending}>
            Отмена
          </button>
          <button className="dm__primary-btn" type="button" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Покупаем..." : "Купить"}
          </button>
        </div>
      </div>
    </div>
  );
}
