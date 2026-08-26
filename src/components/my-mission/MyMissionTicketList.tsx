/* eslint-disable @next/next/no-img-element -- Mission ticket images come from mock/page data. */
import { ExternalLink } from "@/components/ExternalLink";
import type { MissionTicket } from "@/lib/my-mission/types";

type MyMissionTicketListProps = {
  tickets: MissionTicket[];
  title: string;
  completedLabel: string;
  detailsLabel: string;
};

export function MyMissionTicketList({
  tickets,
  title,
  completedLabel,
  detailsLabel,
}: MyMissionTicketListProps): JSX.Element {
  return (
    <section className="myMissionTicketList">
      <h2>{title}</h2>
      <ul>
        {tickets.map((ticket) => (
          <li className="myMissionTicketList__item" key={ticket.id}>
            <div className="myMissionTicketList__product">
              <img src={ticket.imageUrl} alt="" />
              <span>{ticket.title}</span>
            </div>
            {ticket.status === "completed" ? (
              <span className="myMissionTicketList__status">{completedLabel}</span>
            ) : ticket.productUrl ? (
              <ExternalLink
                className="myMissionTicketList__details"
                href={ticket.productUrl}
              >
                {detailsLabel}
              </ExternalLink>
            ) : (
              <span className="myMissionTicketList__details myMissionTicketList__details--disabled">
                {detailsLabel}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
