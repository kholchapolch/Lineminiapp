import "./portal-not-linked.css";

export type PortalNotLinkedViewProps = {
  title: string;
  message: string;
  actionLabel: string;
  actionHref: string;
};

export function PortalNotLinkedView({
  title,
  message,
  actionLabel,
  actionHref,
}: PortalNotLinkedViewProps): JSX.Element {
  return (
    <section className="portalNotLinked">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="portalNotLinked__icon"
        src="/icons/Link.svg"
        alt=""
        width={56}
        height={56}
        aria-hidden="true"
      />
      <h1 className="portalNotLinked__title">{title}</h1>
      {message ? <p className="portalNotLinked__message">{message}</p> : null}
      <a className="portalNotLinked__action" href={actionHref}>
        {actionLabel}
      </a>
    </section>
  );
}
