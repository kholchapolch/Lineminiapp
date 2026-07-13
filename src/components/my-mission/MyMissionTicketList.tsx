/* eslint-disable @next/next/no-img-element -- Mission ticket images come from mock/page data. */
import type { MissionTicket } from "@/lib/my-mission/types";

type MyMissionTicketListProps = {
  tickets: MissionTicket[];
  title: string;
  productCodeLabel: string;
  completedLabel: string;
  detailsLabel: string;
};

export function MyMissionTicketList({
  tickets,
  title,
  productCodeLabel,
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
              <span>
                {productCodeLabel} {ticket.productCode}
              </span>
            </div>
            {ticket.status === "completed" ? (
              <span className="myMissionTicketList__status">{completedLabel}</span>
            ) : (
              <button className="myMissionTicketList__details" type="button">
                {detailsLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
