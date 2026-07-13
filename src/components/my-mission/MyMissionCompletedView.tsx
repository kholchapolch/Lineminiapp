import Link from "next/link";
import { Button } from "@/components/Button";
import { BackArrowIcon } from "@/components/icons/BackArrowIcon";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { ProductBadgeHero } from "@/components/my-product/ProductBadgeHero";
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

  return (
    <main className="myMissionPage__content myMissionPage__content--completed">
      <ProductBadgeHero imageUrl={mission.badgeImageUrl} title={title} />

      <section className="myMissionPage__details">
        <h1>{messages.myMission.receivedTitle}</h1>
        {mission.unlockedAt ? (
          <p className="myMissionPage__meta">
            {messages.myMission.unlockedOn}: {formatUnlockedDate(mission.unlockedAt, locale)}
          </p>
        ) : null}
      </section>

      <div className="myMissionPage__actions">
        <Button variant="solid" icon={<FacebookIcon />} type="button">
          {messages.myMission.share}
        </Button>
        <Link className="sonyButton sonyButton--outline myMissionPage__back" href={backHref}>
          {messages.myMission.backToHome}
        </Link>
      </div>
    </main>
  );
}
