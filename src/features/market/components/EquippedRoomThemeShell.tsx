import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import type { EquippedItem } from "../types";
import { getMarketItemClassToken } from "../equipped";
import "../styles/equippedItems.css";

export function EquippedRoomThemeShell({
  theme,
  children,
  className = "",
}: {
  theme: EquippedItem | null;
  children: ReactNode;
  className?: string;
}) {
  const slug = theme?.item.slug;
  const token = getMarketItemClassToken(slug);
  const themeAssetUrl = theme?.item.asset_url ?? theme?.item.preview_asset_url ?? null;
  return (
    <div
      className={[
        "equipped-room-theme-shell",
        token ? `market-room-theme--${token}` : "",
        className,
      ].filter(Boolean).join(" ")}
      style={themeAssetUrl ? ({ "--market-room-theme-image": `url("${themeAssetUrl}")` } as CSSProperties) : undefined}
      data-equipped-room-theme={slug ?? undefined}
    >
      {children}
    </div>
  );
}
