import "./portal-empty-products.css";

export type PortalEmptyProductsViewProps = {
  title: string;
  actionLabel: string;
  actionHref: string;
};

export function PortalEmptyProductsView({
  title,
  actionLabel,
  actionHref,
}: PortalEmptyProductsViewProps): JSX.Element {
  return (
    <section className="portalEmptyProducts">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="portalEmptyProducts__icon"
        src="/icons/codicon_empty-window.svg"
        alt=""
        width={76}
        height={76}
        aria-hidden="true"
      />
      <h1 className="portalEmptyProducts__title">{title}</h1>
      <a className="portalEmptyProducts__action" href={actionHref}>
        <span>{actionLabel}</span>
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
