import { useEffect, useState, type ReactNode } from "react";
import type { EquippedItem } from "../types";
import { getMarketItemClassToken } from "../equipped";
import "../styles/equippedItems.css";

export function EquippedProfileFrame({
  frame,
  children,
  size = "md",
  className = "",
}: {
  frame: EquippedItem | null;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const slug = frame?.item.slug;
  const token = getMarketItemClassToken(slug);
  const frameAssetUrl = frame?.item.asset_url ?? frame?.item.preview_asset_url ?? null;
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => {
    setAssetFailed(false);
  }, [frameAssetUrl]);

  return (
    <div
      className={[
        "equipped-profile-frame",
        `equipped-profile-frame--${size}`,
        token ? `market-frame--${token}` : "",
        className,
      ].filter(Boolean).join(" ")}
      data-equipped-frame={slug ?? undefined}
    >
      {children}
      {frameAssetUrl && !assetFailed && (
        <img
          className="equipped-profile-frame__asset"
          src={frameAssetUrl}
          alt=""
          aria-hidden="true"
          onError={() => setAssetFailed(true)}
        />
      )}
    </div>
  );
}
