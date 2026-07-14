import { Fragment } from "react";
import Link from "next/link";
import { MissionSection } from "@/components/my-missions/MissionSection";
import { MissionSectionSpacer } from "@/components/my-missions/MissionSectionSpacer";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";
import type { MyMissionsData } from "@/lib/my-missions/types";

type MyMissionsViewProps = {
  locale: Locale;
  messages: Messages;
  data: MyMissionsData;
};

export function MyMissionsView({ locale, messages, data }: MyMissionsViewProps): JSX.Element {
  return (
    <div className="myMissionsPage">
      <main className="myMissionsPage__content">
        <header className="myMissionsPage__header">
          <h1>{messages.myMissions.title}</h1>
          <p>{messages.myMissions.description}</p>
        </header>

        <div className="myMissionsPage__sections">
          {data.sections.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === data.sections.length - 1;

            return (
              <Fragment key={section.id}>
                {index > 0 ? <MissionSectionSpacer /> : null}
                <MissionSection
                  locale={locale}
                  section={section}
                  title={messages.myMissions.sections[section.id].title}
                  description={messages.myMissions.sections[section.id].description}
                  showTopEdge={isFirst}
                  showBottomEdge={isLast}
                />
              </Fragment>
            );
          })}
        </div>

        <div className="myMissionsPage__footer">
          <Link
            className="sonyButton sonyButton--outline myMissionsPage__back"
            href={localizedPath(locale, "my-badges")}
          >
            {messages.myMissions.backToMyBadges}
          </Link>
        </div>
      </main>
    </div>
  );
}
