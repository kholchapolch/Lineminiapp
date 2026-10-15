import type { CSSProperties } from "react";
import "@/components/page-loading/page-loading.css";
import "@/components/portal/portal-product-card.css";

function Bone({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={["pageLoadingSkeleton", "pageLoadingSkeleton--portal", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    />
  );
}

export function PortalProductSkeleton({
  ariaLabel = "Loading products",
}: {
  ariaLabel?: string;
}): JSX.Element {
  return (
    <div className="portalProductList" aria-busy="true" aria-label={ariaLabel}>
      {[0, 1].map((card) => (
        <div className="pageLoadingPortal__box" key={card}>
          <Bone className="pageLoadingSkeleton--card" style={{ height: 200, borderRadius: 16 }} />
          <Bone style={{ width: "55%", height: 26, marginTop: 16 }} />
          <Bone style={{ width: "75%", height: 16, marginTop: 8 }} />
          <div className="pageLoadingPortal__meta">
            <div className="pageLoadingPortal__serial">
              <Bone style={{ width: 24, height: 24 }} />
              <div style={{ display: "grid", gap: 6, flex: 1 }}>
                <Bone style={{ width: "60%", height: 16 }} />
                <Bone style={{ width: "40%", height: 12 }} />
              </div>
            </div>
            <div className="pageLoadingPortal__warranty">
              <div style={{ display: "grid", gap: 6, flex: 1 }}>
                <Bone style={{ width: "45%", height: 12 }} />
                <Bone style={{ width: "55%", height: 16 }} />
              </div>
              <Bone className="pageLoadingSkeleton--pill" style={{ width: 64, height: 24 }} />
            </div>
          </div>
          <div className="pageLoadingPortal__ctas">
            <Bone style={{ width: 160, height: 48, borderRadius: 14 }} />
            <Bone style={{ width: 140, height: 48, borderRadius: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
