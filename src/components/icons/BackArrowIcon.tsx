type BackArrowIconProps = {
  className?: string;
};

export function BackArrowIcon({ className }: BackArrowIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.5 4.5 7.5 10l5 5.5" />
    </svg>
  );
}
