import { VerifiedIcon } from "@/components/icons/VerifiedIcon";
import type { MyBadgesProfile } from "@/lib/my-badges/types";

type MyBadgesProfileCardProps = {
  profile: MyBadgesProfile;
};

export function MyBadgesProfileCard({
  profile,
}: MyBadgesProfileCardProps): JSX.Element {
  return (
    <section className="myBadgesProfileCard">
      <div className="myBadgesProfileCard__avatarWrap">
        {/* eslint-disable-next-line @next/next/no-img-element -- Avatar URL comes from mock/page data. */}
        <img
          className="myBadgesProfileCard__avatar"
          src={profile.avatarUrl}
          alt=""
        />
        {profile.isOnline ? (
          <span className="myBadgesProfileCard__online" aria-hidden="true" />
        ) : null}
      </div>
      <h1 className="myBadgesProfileCard__name">{profile.displayName}</h1>
      <p className="myBadgesProfileCard__handle">{profile.handle}</p>
    </section>
  );
}
