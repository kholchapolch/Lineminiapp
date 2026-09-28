import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { TealiumBodyScript, TealiumHeadScripts } from "@/components/TealiumScripts";
import { sukhumvitSet } from "@/lib/fonts";
import { defaultLocale } from "@/lib/i18n/locales";
import { isDigitalBadgeHomePath } from "@/lib/tealium";

export const metadata: Metadata = {
  title: "Sony Thailand",
  description: "Sony Thailand LIFF badge display pilot",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#161819",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  const requestHeaders = headers();
  const locale = requestHeaders.get("x-locale") ?? defaultLocale;
  const trackHome = isDigitalBadgeHomePath(requestHeaders.get("x-pathname") ?? "");

  return (
    <html lang={locale} className={sukhumvitSet.variable}>
      <head>{trackHome ? <TealiumHeadScripts /> : null}</head>
      <body className={sukhumvitSet.className}>
        {trackHome ? <TealiumBodyScript /> : null}
        {children}
      </body>
    </html>
  );
}
