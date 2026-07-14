type VerifiedIconProps = {
  className?: string;
};

export function VerifiedIcon({ className }: VerifiedIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="8" fill="#1db954" />
      <path
        d="M4.75 8.1 6.9 10.25 11.25 5.9"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
