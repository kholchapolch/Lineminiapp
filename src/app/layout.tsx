import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { sukhumvitSet } from "@/lib/fonts";
import { defaultLocale } from "@/lib/i18n/locales";

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
  const locale = headers().get("x-locale") ?? defaultLocale;

  return (
    <html lang={locale} className={sukhumvitSet.variable}>
      <body className={sukhumvitSet.className}>{children}</body>
    </html>
  );
}
