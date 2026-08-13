/* eslint-disable @next/next/no-img-element -- Mission badge images come from mock/page data. */
import Link from "next/link";
import { Button } from "@/components/Button";
import { BackArrowIcon } from "@/components/icons/BackArrowIcon";
import { RegisterNavIcon } from "@/components/icons/NavIcons";
import { MyMissionTicketList } from "@/components/my-mission/MyMissionTicketList";
import type { Messages } from "@/lib/i18n/messages/types";
import type { MyMissionDetailData } from "@/lib/my-mission/types";
import { getMissionBadgeVisualState } from "@/lib/my-missions/badge-visual-state";
import {
  buildLineMiniAppMissionCallbackUrl,
  buildRegisterProductUrl,
} from "@/lib/register-product-url";

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
  const badgeVisualState = getMissionBadgeVisualState(
    mission.progress,
    mission.target,
  );
  const callbackUrl = buildLineMiniAppMissionCallbackUrl(mission.id);
  const registerHref = callbackUrl
    ? buildRegisterProductUrl(callbackUrl)
    : undefined;

  return (
    <main className="myMissionPage__content myMissionPage__content--progress">
      <header className="myMissionPage__header">
        <h1>{title}</h1>
      </header>

      <section className="myMissionSummaryCard">
        <div className="myMissionSummaryCard__top">
          <div
            className={`myMissionSummaryCard__badge myMissionSummaryCard__badge--${badgeVisualState}`}
          >
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
        {registerHref ? (
          <Button
            className="myMissionSummaryCard__register"
            variant="solid"
            icon={<RegisterNavIcon />}
            href={registerHref}
          >
            {messages.myMission.registerProduct}
          </Button>
        ) : null}
      </section>

      <MyMissionTicketList
        tickets={mission.tickets}
        title={messages.myMission.ticketMissionTitle}
        completedLabel={messages.myMission.completed}
        detailsLabel={messages.myMission.details}
      />

      <Link
        className="sonyButton sonyButton--outline myMissionPage__back"
        href={backHref}
      >
        <span className="sonyButton__icon">
          <BackArrowIcon />
        </span>
        <span className="sonyButton__label">{messages.myMission.back}</span>
      </Link>
    </main>
  );
}
