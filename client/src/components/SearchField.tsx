import { useEffect, useId, useRef, useState } from "react";
import { fieldControl, fieldLabel } from "./styles";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const DEBOUNCE_MS = 300;

export function SearchField({ value, onChange }: SearchFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync from URL (back/forward) without clobbering a trailing space mid-typing.
  useEffect(() => {
    setDraft((prev) => (prev.trim() === value ? prev : value));
  }, [value]);

  useEffect(() => {
    const next = draft.trim();
    if (next === value) return;
    const timer = window.setTimeout(() => onChangeRef.current(next), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className={fieldLabel}>
        Search
      </label>
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13 13 3.5 3.5" />
        </svg>
        <input
          id={id}
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search by first or last name"
          autoComplete="off"
          className={`${fieldControl} pr-3 pl-9`}
        />
      </div>
    </div>
  );
}
