import "./portal-register.css";

export type PortalRegisterViewProps = {
  title: string;
  lead: string;
  imageUrl: string | null;
  imageAlt: string;
  benefitsTitle: string;
  benefits: string[];
  registerLabel: string;
  registerHref: string;
  homeLabel: string;
  homeHref: string;
};

function CheckIcon(): JSX.Element {
  return (
    <svg
      className="portalRegister__checkIcon"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.12" />
      <path
        d="M5.8 10.2 8.4 12.8 14.2 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PortalRegisterView({
  title,
  lead,
  imageUrl,
  imageAlt,
  benefitsTitle,
  benefits,
  registerLabel,
  registerHref,
  homeLabel,
  homeHref,
}: PortalRegisterViewProps): JSX.Element {
  return (
    <section className="portalRegister">
      <header className="portalRegister__intro">
        <h1 className="portalRegister__title">{title}</h1>
        <p className="portalRegister__lead">{lead}</p>
      </header>

      {imageUrl ? (
        <div className="portalRegister__hero">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS/CDN product imagery. */}
          <img className="portalRegister__heroImage" src={imageUrl} alt={imageAlt} />
        </div>
      ) : null}

      {benefits.length > 0 ? (
        <div className="portalRegister__card">
          <h2 className="portalRegister__cardTitle">{benefitsTitle}</h2>
          <ul className="portalRegister__benefits">
            {benefits.map((item) => (
              <li key={item} className="portalRegister__benefit">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="portalRegister__actions">
        <a
          className="portalRegister__primary"
          href={registerHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{registerLabel}</span>
          <span aria-hidden="true">→</span>
        </a>
        <a className="portalRegister__secondary" href={homeHref}>
          {homeLabel}
        </a>
      </div>
    </section>
  );
}
