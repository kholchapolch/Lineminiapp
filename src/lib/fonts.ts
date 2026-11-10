import { Inter, Open_Sans, Poppins } from "next/font/google";
import localFont from "next/font/local";

// Import fonts from public/fonts directory
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

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

export const sst = localFont({
  src: [
    {
      path: "../../public/fonts/sst/SSTLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTLightIt.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/sst/SSTRg.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTRgIt.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/sst/SSTMedium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTMediumIt.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/sst/SSTBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTBoldIt.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/sst/SSTHeavy.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTHeavyIt.ttf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-sst",
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

export const sstCondensed = localFont({
  src: [
    {
      path: "../../public/fonts/sst/SSTRgCn.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTMediumCn.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sst/SSTBoldCn.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sst-condensed",
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
