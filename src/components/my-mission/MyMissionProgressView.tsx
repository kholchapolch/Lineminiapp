/* eslint-disable @next/next/no-img-element -- Mission badge images come from mock/page data. */
import Link from "next/link";
import { Button } from "@/components/Button";
import { BackArrowIcon } from "@/components/icons/BackArrowIcon";
import { RegisterNavIcon } from "@/components/icons/NavIcons";
import { MyMissionTicketList } from "@/components/my-mission/MyMissionTicketList";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import type { MyMissionDetailData } from "@/lib/my-mission/types";

type MyMissionProgressViewProps = {
  messages: Messages;
  data: MyMissionDetailData;
  title: string;
  description: string;
  backHref: string;
};

export function MyMissionProgressView({
  messages,
  data,
  title,
  description,
  backHref,
}: MyMissionProgressViewProps): JSX.Element {
  const { mission } = data;

  return (
    <main className="myMissionPage__content myMissionPage__content--progress">
      <header className="myMissionPage__header">
        <h1>{title}</h1>
      </header>

      <section className="myMissionSummaryCard">
        <div className="myMissionSummaryCard__top">
          <div className="myMissionSummaryCard__badge">
            <img src={mission.badgeImageUrl} alt="" />
          </div>
          <div className="myMissionSummaryCard__body">
            <h2>{title}</h2>
            <p>{description}</p>
            <p className="myMissionSummaryCard__progress">
              {mission.progress}/{mission.target}
            </p>
          </div>
        </div>
        <Button
          className="myMissionSummaryCard__register"
          variant="solid"
          icon={<RegisterNavIcon />}
          href={process.env.NEXT_PUBLIC_REGISTER_PRODUCT_URL}
        >
          {messages.myMission.registerProduct}
        </Button>
      </section>

      <MyMissionTicketList
        tickets={mission.tickets}
        title={messages.myMission.ticketMissionTitle}
        productCodeLabel={messages.myMission.productCode}
        completedLabel={messages.myMission.completed}
        detailsLabel={messages.myMission.details}
      />

      <Link className="sonyButton sonyButton--outline myMissionPage__back" href={backHref}>
        <span className="sonyButton__icon">
          <BackArrowIcon />
        </span>
        <span className="sonyButton__label">{messages.myMission.back}</span>
      </Link>
    </main>
  );
}
