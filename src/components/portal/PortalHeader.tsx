import "./portal-header.css";

export type PortalHeaderProps = {
  displayName: string;
  pictureUrl?: string | null;
  pending?: boolean;
};

export function PortalHeader({
  displayName,
  pictureUrl,
  pending = false,
}: PortalHeaderProps): JSX.Element {
  if (pending) {
    return (
      <header className="portalHeader" aria-busy="true">
        <div className="portalHeader__profile">
          <span className="portalHeader__skeletonAvatar" aria-hidden="true" />
          <span className="portalHeader__skeletonName" aria-hidden="true" />
        </div>
      </header>
    );
  }

  const avatarInitial = displayName.trim().slice(0, 1) || "?";

  return (
    <header className="portalHeader">
      <div className="portalHeader__profile">
        {pictureUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- LINE profile image comes from LIFF or mock data. */
          <img
            className="portalHeader__avatar"
            src={pictureUrl}
            alt=""
          />
        ) : (
          <div
            className="portalHeader__avatar portalHeader__avatar--placeholder"
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
        )}
        <h1 className="portalHeader__name">{displayName}</h1>
      </div>
    </header>
  );
}
