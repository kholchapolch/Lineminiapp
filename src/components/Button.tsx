import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline";

type SharedButtonProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type ButtonProps = SharedButtonProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export function Button({
  variant = "solid",
  icon,
  children,
  className,
  href,
  ...props
}: ButtonProps): JSX.Element {
  const classes = ["sonyButton", `sonyButton--${variant}`, className].filter(Boolean).join(" ");
  const content = (
    <>
      {icon ? <span className="sonyButton__icon">{icon}</span> : null}
      <span className="sonyButton__label">{children}</span>
    </>
  );

  if (href) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? "button"} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
