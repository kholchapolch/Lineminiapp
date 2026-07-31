type FacebookIconProps = {
  className?: string;
};

export function FacebookIcon({ className }: FacebookIconProps): JSX.Element {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 10.061C20 4.505 15.522 0 10 0S0 4.505 0 10.061c0 5.02 3.657 9.184 8.438 9.939v-7.03H5.898V10.06h2.54V7.845c0-2.5 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.242 0-1.63.771-1.63 1.562v1.888h2.773l-.443 2.908h-2.33v7.03C16.343 19.245 20 15.08 20 10.06Z" />
    </svg>
  );
}
