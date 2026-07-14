import type { CSSProperties } from "react";
import "./page-loading.css";

export type PageLoadingVariant =
  | "my-badges"
  | "my-products"
  | "my-missions"
  | "my-product-detail"
  | "my-mission-detail";

type PageLoadingProps = {
  variant: PageLoadingVariant;
};

function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}): JSX.Element {
  return <span aria-hidden="true" className={["pageLoadingSkeleton", className].filter(Boolean).join(" ")} style={style} />;
}

function MyBadgesLoading(): JSX.Element {
  return (
    <div className="pageLoading">
      <main className="pageLoading__content pageLoading__content--badges">
        <div className="pageLoadingBadges">
          <Skeleton className="pageLoadingSkeleton--circle" style={{ width: 100, height: 100 }} />
          <Skeleton className="pageLoadingSkeleton--pill" style={{ width: 160, height: 28 }} />
          <Skeleton className="pageLoadingSkeleton--pill" style={{ width: 200, height: 18 }} />
        </div>

        <div className="pageLoadingBadges__stats">
          <Skeleton style={{ height: 56 }} />
          <Skeleton style={{ width: 1, height: 56 }} />
          <Skeleton style={{ height: 56 }} />
        </div>

        {[0, 1].map((section) => (
          <section className="pageLoadingBadges__section" key={section}>
            <Skeleton style={{ width: "55%", height: 22, marginBottom: 16 }} />
            <div className="pageLoadingBadges__grid">
              {[0, 1, 2].map((item) => (
                <Skeleton className="pageLoadingSkeleton--card" key={item} style={{ height: 180 }} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <div className="pageLoadingBadges__bottomBar">
        <Skeleton style={{ height: 56, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function MyProductsLoading(): JSX.Element {
  return (
    <div className="pageLoading">
      <main className="pageLoading__content">
        <Skeleton style={{ width: "70%", height: 28, margin: "0 auto 12px" }} />
        <Skeleton style={{ width: "90%", height: 16, margin: "0 auto 20px" }} />

        <div className="pageLoadingProducts__filter">
          <Skeleton style={{ height: 48, borderRadius: 14 }} />
        </div>

        <div className="pageLoadingProducts__grid">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton className="pageLoadingSkeleton--card" key={item} style={{ height: 180 }} />
          ))}
        </div>
      </main>
    </div>
  );
}

function MyMissionsLoading(): JSX.Element {
  return (
    <div className="pageLoading">
      <main className="pageLoading__content">
        <Skeleton style={{ width: "75%", height: 28, margin: "0 auto 12px" }} />
        <Skeleton style={{ width: "92%", height: 16, margin: "0 auto 28px" }} />

        {[0, 1].map((section) => (
          <section className="pageLoadingMissions__section" key={section}>
            {section > 0 ? <Skeleton style={{ height: 32, marginBottom: 0 }} /> : null}
            <Skeleton style={{ height: 10, marginBottom: 0 }} />
            <div style={{ padding: "28px 0 32px" }}>
              <Skeleton style={{ width: "50%", height: 22, margin: "0 auto 10px" }} />
              <Skeleton style={{ width: "80%", height: 14, margin: "0 auto 8px" }} />
              <div className="pageLoadingMissions__tiers">
                {[0, 1, 2].map((tier) => (
                  <div key={tier} style={{ display: "grid", gap: 10, justifyItems: "center" }}>
                    <Skeleton className="pageLoadingSkeleton--circle" style={{ width: 92, height: 92 }} />
                    <Skeleton className="pageLoadingSkeleton--pill" style={{ width: 48, height: 22 }} />
                  </div>
                ))}
              </div>
            </div>
            <Skeleton style={{ height: 10 }} />
          </section>
        ))}
      </main>
    </div>
  );
}

function MyProductDetailLoading(): JSX.Element {
  return (
    <div className="pageLoading">
      <main className="pageLoading__content pageLoadingDetail">
        <Skeleton style={{ width: "55%", height: 20, marginBottom: 8 }} />
        <Skeleton className="pageLoadingSkeleton--circle" style={{ width: 280, height: 280, marginBottom: 12 }} />
        <Skeleton style={{ width: "70%", height: 32, marginBottom: 10 }} />
        <Skeleton style={{ width: "50%", height: 22, marginBottom: 8 }} />
        <Skeleton style={{ width: "45%", height: 22 }} />

        <div className="pageLoadingDetail__actions">
          <Skeleton style={{ height: 48, borderRadius: 999 }} />
          <Skeleton style={{ height: 48, borderRadius: 999 }} />
        </div>
      </main>
    </div>
  );
}

function MyMissionDetailLoading(): JSX.Element {
  return (
    <div className="pageLoading">
      <main className="pageLoading__content">
        <Skeleton style={{ width: "60%", height: 28, margin: "0 auto 20px" }} />

        <div className="pageLoadingMission__card">
          <Skeleton className="pageLoadingSkeleton--circle" style={{ width: 92, height: 92 }} />
          <div style={{ display: "grid", gap: 10 }}>
            <Skeleton style={{ width: "70%", height: 20 }} />
            <Skeleton style={{ width: "100%", height: 14 }} />
            <Skeleton style={{ width: "100%", height: 14 }} />
            <Skeleton className="pageLoadingSkeleton--pill" style={{ width: 48, height: 22 }} />
            <Skeleton style={{ width: "100%", height: 44, borderRadius: 999 }} />
          </div>
        </div>

        <Skeleton style={{ width: "65%", height: 20, marginBottom: 14 }} />
        <div className="pageLoadingMission__list">
          {[0, 1, 2, 3, 4].map((row) => (
            <div className="pageLoadingMission__row" key={row}>
              <Skeleton style={{ width: "65%", height: 40 }} />
              <Skeleton className="pageLoadingSkeleton--pill" style={{ width: 72, height: 32 }} />
            </div>
          ))}
        </div>

        <Skeleton style={{ height: 48, borderRadius: 999, marginTop: 28 }} />
      </main>
    </div>
  );
}

export function PageLoading({ variant }: PageLoadingProps): JSX.Element {
  switch (variant) {
    case "my-badges":
      return <MyBadgesLoading />;
    case "my-products":
      return <MyProductsLoading />;
    case "my-missions":
      return <MyMissionsLoading />;
    case "my-product-detail":
      return <MyProductDetailLoading />;
    case "my-mission-detail":
      return <MyMissionDetailLoading />;
  }
}
