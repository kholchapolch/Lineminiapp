import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sony Badge Pilot",
  description: "Sony Thailand LIFF badge display pilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
