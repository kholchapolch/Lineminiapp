"use client";

import { BottomBar } from "@/components/BottomBar";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { localizedPath } from "@/lib/i18n/paths";

type MyBadgesBottomBarProps = {
  locale: Locale;
  messages: Messages;
};

export function MyBadgesBottomBar({ locale, messages }: MyBadgesBottomBarProps): JSX.Element {
  return (
    <BottomBar
      ariaLabel={messages.bottomBar.ariaLabel}
      activeItem="home"
      labels={{
        home: messages.bottomBar.home,
        register: messages.bottomBar.register,
        inquiry: messages.bottomBar.inquiry,
      }}
      hrefs={{
        home: localizedPath(locale, "my-badges"),
        register: process.env.NEXT_PUBLIC_ACCOUNT_URL,
        inquiry: localizedPath(locale, "badges"),
      }}
      className="myBadgesBottomBar"
    />
  );
}
