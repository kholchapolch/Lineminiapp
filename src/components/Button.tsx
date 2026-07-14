import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "solid" | "outline";

export type ButtonProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "solid",
  icon,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps): JSX.Element {
  const classes = ["sonyButton", `sonyButton--${variant}`, className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {icon ? <span className="sonyButton__icon">{icon}</span> : null}
      <span className="sonyButton__label">{children}</span>
    </button>
  );
}
