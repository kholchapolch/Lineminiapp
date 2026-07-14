import Link from "next/link";
import { FacebookShareAction } from "@/components/FacebookShareAction";

type MyProductActionsProps = {
  shareLabel: string;
  backLabel: string;
  backHref: string;
  shareUrl?: string;
};

export function MyProductActions({
  shareLabel,
  backLabel,
  backHref,
  shareUrl,
}: MyProductActionsProps): JSX.Element {
  return (
    <div className="myProductPage__actions">
      <FacebookShareAction label={shareLabel} url={shareUrl} hashtag="#SonyThailand" />
      <Link className="sonyButton sonyButton--outline myProductPage__back" href={backHref}>
        {backLabel}
      </Link>
    </div>
  );
}
