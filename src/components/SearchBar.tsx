"use client";

import { Search, X } from "lucide-react";
import type { RefObject } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Shown in the input when empty. */
  placeholder?: string;
  /** Accessible label for the input. */
  label?: string;
  /** Optional ref so a parent can focus the input (e.g. the "/" shortcut). */
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search tools… try “password”, “JSON” or “QR”",
  label = "Search tools",
  inputRef,
}: SearchBarProps) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base text-card-foreground shadow-lg placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          /
        </kbd>
      )}
    </div>
  );
}
