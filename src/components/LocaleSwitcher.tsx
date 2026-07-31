"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages/types";
import { swapLocaleInPath } from "@/lib/i18n/paths";

type LocaleSwitcherProps = {
  locale: Locale;
  messages: Messages;
};

export function LocaleSwitcher({ locale, messages }: LocaleSwitcherProps): JSX.Element {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <nav className="localeSwitcher" aria-label={messages.language.label}>
      {locales.map((option) => {
        const href = `${swapLocaleInPath(pathname, option)}${query ? `?${query}` : ""}`;
        const isActive = option === locale;

        return (
          <Link
            key={option}
            href={href}
            hrefLang={option}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? "isActive" : undefined}
          >
            {messages.language[option]}
          </Link>
        );
      })}
    </nav>
  );
}
