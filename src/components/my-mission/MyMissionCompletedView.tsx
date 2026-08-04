import Link from "next/link";
import { FacebookShareAction } from "@/components/FacebookShareAction";
import { ProductBadgeHero } from "@/components/my-product/ProductBadgeHero";
import { getBadgeImageBaseUrl, toShareableAssetUrl } from "@/lib/absolute-url";
import { formatUnlockedDate } from "@/lib/my-product/format-unlocked-date";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import type { MyMissionDetailData } from "@/lib/my-mission/types";

type MyMissionCompletedViewProps = {
  locale: Locale;
  messages: Messages;
  data: MyMissionDetailData;
  title: string;
  backHref: string;
};

export function MyMissionCompletedView({
  locale,
  messages,
  data,
  title,
  backHref,
}: MyMissionCompletedViewProps): JSX.Element {
  const { mission } = data;
  const shareImageUrl =
    toShareableAssetUrl(
      mission.shareImageUrl || mission.badgeImageUrl,
      getBadgeImageBaseUrl(),
    ) ?? "";

  return (
    <main className="myMissionPage__content myMissionPage__content--completed">
      <p className="myMissionPage__eyebrow">{messages.myMission.shareTitle}</p>

      <ProductBadgeHero
        imageUrl={mission.badgeImageUrl}
        title={title}
        href={shareImageUrl || null}
      />

      <section className="myMissionPage__details">
        <h1>{messages.myMission.receivedTitle}</h1>
        {mission.unlockedAt ? (
          <p className="myMissionPage__meta">
            {messages.myMission.unlockedOn}:{" "}
            {formatUnlockedDate(mission.unlockedAt, locale)}
          </p>
        ) : null}
      </section>

      <div className="myMissionPage__actions">
        <FacebookShareAction
          label={messages.myMission.share}
          url={shareImageUrl}
        />
        <Link
          className="sonyButton sonyButton--outline myMissionPage__back"
          href={backHref}
        >
          {messages.myMission.backToHome}
        </Link>
      </div>
    </main>
  );
}
