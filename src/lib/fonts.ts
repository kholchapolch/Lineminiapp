import localFont from "next/font/local";

export const sukhumvitSet = localFont({
  src: [
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-Text.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/SukhumwitSet/SukhumvitSet-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sukhumvit-set",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "sans-serif",
  ],
});
