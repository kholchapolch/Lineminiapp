type NavIconProps = {
  className?: string;
};

export function HomeNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 21V13C15 12.7348 14.8946 12.4804 14.7071 12.2929C14.5196 12.1054 14.2652 12 14 12H10C9.73478 12 9.48043 12.1054 9.29289 12.2929C9.10536 12.4804 9 12.7348 9 13V21M3 10.0005C2.99993 9.70955 3.06333 9.4221 3.18579 9.1582C3.30824 8.89429 3.4868 8.66028 3.709 8.47248L10.709 2.47248C11.07 2.16739 11.5274 2 12 2C12.4726 2 12.93 2.16739 13.291 2.47248L20.291 8.47248C20.5132 8.66028 20.6918 8.89429 20.8142 9.1582C20.9367 9.4221 21.0001 9.70955 21 10.0005V19.0005C21 19.5309 20.7893 20.0396 20.4142 20.4147C20.0391 20.7898 19.5304 21.0005 19 21.0005H5C4.46957 21.0005 3.96086 20.7898 3.58579 20.4147C3.21071 20.0396 3 19.5309 3 19.0005V10.0005Z"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
}

export function RegisterNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 20V22.97H17V20H14V18H17V15H19V18H22V20H19ZM21 11C21 11.9 20.9 12.78 20.71 13.65C20.13 13.35 19.5 13.15 18.81 13.05C18.93 12.45 19 11.83 19 11.22V6.3L12 3.18L5 6.3V11.22C5 15.54 8.25 20 12 21L12.31 20.91C12.5 21.53 12.83 22.11 13.22 22.62L12 23C6.84 21.74 3 16.55 3 11V5L12 1L21 5V11Z"
        fill="#D5E3F4"
      />
    </svg>
  );
}

export function InquiryNavIcon({ className }: NavIconProps): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_254_4916)">
        <path
          d="M22.2 2.57031H1.8C1.52116 2.57137 1.25409 2.68288 1.05729 2.88043C0.860495 3.07798 0.749998 3.34547 0.75 3.62431V17.2123C0.749998 17.4912 0.860495 17.7586 1.05729 17.9562C1.25409 18.1537 1.52116 18.2653 1.8 18.2663H4.243C4.0227 19.4099 3.54912 20.4897 2.857 21.4263C5.907 21.4703 7.837 20.2903 8.995 18.2663H22.2C22.4795 18.2663 22.7476 18.1553 22.9453 17.9576C23.143 17.7599 23.254 17.4918 23.254 17.2123V3.62431C23.254 3.34477 23.143 3.07669 22.9453 2.87902C22.7476 2.68136 22.4795 2.57031 22.2 2.57031Z"
          stroke="#D5E3F4"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_254_4916">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
