type NavIconProps = {
  className?: string;
};

export function HomeNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 10.5 12 4.5l7.5 6" />
      <path d="M6 9.75V19.5h12V9.75" />
      <path d="M10.5 19.5v-6h3v6" />
    </svg>
  );
}

export function RegisterNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.75 5.25 6.75v5.25c0 4.2 2.88 8.13 6.75 9 3.87-.87 6.75-4.8 6.75-9V6.75L12 3.75Z" />
      <path d="M12 9.75v5.25" />
      <path d="M9.375 12.375h5.25" />
    </svg>
  );
}

export function InquiryNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.25 6.75h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H9.75L5.25 19.5V8.25a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}
