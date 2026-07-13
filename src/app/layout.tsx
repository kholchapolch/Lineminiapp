import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { defaultLocale } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "Sony Badge Pilot",
  description: "Sony Thailand LIFF badge display pilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  const locale = headers().get("x-locale") ?? defaultLocale;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
