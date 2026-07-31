import { defaultBadgesPath } from "@/lib/i18n/paths";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function Home(): never {
  redirect(defaultBadgesPath());
}
