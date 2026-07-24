import { MyMissionCompletedView } from "@/components/my-mission/MyMissionCompletedView";
import { MyMissionProgressView } from "@/components/my-mission/MyMissionProgressView";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";
import type { MyMissionDetailData } from "@/lib/my-mission/types";
import { isMissionComplete } from "@/lib/my-mission/types";

type MyMissionViewProps = {
  locale: Locale;
  messages: Messages;
  data: MyMissionDetailData;
};

export function MyMissionView({ locale, messages, data }: MyMissionViewProps): JSX.Element {
  const { mission } = data;
  const sectionMessages = messages.myMissions.sections[mission.sectionId];
  const missionsHref = localizedPath(locale, "my-missions");
  const homeHref = localizedPath(locale, "my-badges");
  const isComplete = isMissionComplete(mission);

  return (
    <div className="myMissionPage">
      {isComplete ? (
        <MyMissionCompletedView
          locale={locale}
          messages={messages}
          data={data}
          title={sectionMessages.title}
          backHref={homeHref}
        />
      ) : (
        <MyMissionProgressView
          locale={locale}
          messages={messages}
          data={data}
          title={sectionMessages.title}
          description={sectionMessages.description}
          backHref={missionsHref}
        />
      )}
    </div>
  );
}
