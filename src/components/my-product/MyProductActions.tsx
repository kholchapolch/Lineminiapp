import Link from "next/link";
import { Button } from "@/components/Button";
import { FacebookIcon } from "@/components/icons/FacebookIcon";

type MyProductActionsProps = {
  shareLabel: string;
  backLabel: string;
  backHref: string;
};

export function MyProductActions({
  shareLabel,
  backLabel,
  backHref,
}: MyProductActionsProps): JSX.Element {
  return (
    <div className="myProductPage__actions">
      <Button variant="solid" icon={<FacebookIcon />} type="button">
        {shareLabel}
      </Button>
      <Link className="sonyButton sonyButton--outline myProductPage__back" href={backHref}>
        {backLabel}
      </Link>
    </div>
  );
}
