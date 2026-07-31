"use client";

import { useLineSession } from "@/components/LineSessionProvider";
import type { MyBadgesProfile } from "@/lib/my-badges/types";

type MyBadgesProfileCardProps = {
  profile: MyBadgesProfile;
};

export function MyBadgesProfileCard({
  profile: fallbackProfile,
}: MyBadgesProfileCardProps): JSX.Element {
  const { lineProfile } = useLineSession();

  const lineDisplayName =
    lineProfile?.displayName ?? fallbackProfile.lineDisplayName;
  const linePictureUrl =
    lineProfile?.pictureUrl ?? fallbackProfile.linePictureUrl;
  const isOnline = lineProfile ? true : fallbackProfile.isOnline;
  const avatarInitial = lineDisplayName.slice(0, 1);

  return (
    <section className="myBadgesProfileCard">
      <div className="myBadgesProfileCard__avatarWrap">
        {linePictureUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- LINE profile image comes from LIFF or mock data. */
          <img
            className="myBadgesProfileCard__avatar"
            src={linePictureUrl}
            alt=""
          />
        ) : (
          <div
            className="myBadgesProfileCard__avatar myBadgesProfileCard__avatar--placeholder"
            aria-hidden="true"
          >
            {avatarInitial}
          </div>
        )}
      </div>
      <h1 className="myBadgesProfileCard__name">{lineDisplayName}</h1>
      {fallbackProfile.handle ? (
        <p className="myBadgesProfileCard__handle">{fallbackProfile.handle}</p>
      ) : null}
    </section>
  );
}
