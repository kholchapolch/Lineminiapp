"use client";

import { useEffect, useId, useRef, useState } from "react";

export type FilterDropdownOption = {
  id: string;
  label: string;
};

export type FilterDropdownProps = {
  ariaLabel: string;
  options: FilterDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function ChevronIcon({ direction }: { direction: "up" | "down" }): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={direction === "down" ? "M4 6l4 4 4-4" : "M4 10l4-4 4 4"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilterDropdown({
  ariaLabel,
  options,
  value,
  onChange,
  className,
}: FilterDropdownProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.id === value) ?? options[0];
  const classes = ["filterDropdown", open ? "filterDropdown--open" : null, className]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className={classes} ref={rootRef}>
      <button
        type="button"
        className="filterDropdown__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>

      {open ? (
        <ul className="filterDropdown__menu" id={listboxId} role="listbox" aria-label={ariaLabel}>
          {options.map((option) => {
            const isSelected = option.id === value;

            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`filterDropdown__option${isSelected ? " isSelected" : ""}`}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
