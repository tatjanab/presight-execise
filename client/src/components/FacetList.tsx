import { useRef } from "react";
import type { ReactNode } from "react";
import type { Facet } from "../api/directory";
import { FacetListSkeleton } from "./Skeletons";
import { StatusMessage } from "./StatusMessage";
import { focusRing } from "./styles";

type FacetSectionProps = {
  title: string;
  selectedCount: number;
  onClear: () => void;
  busy: boolean;
  children: ReactNode;
  className?: string;
};

function FacetSection({
  title,
  selectedCount,
  onClear,
  busy,
  children,
  className = "",
}: FacetSectionProps) {
  return (
    <section
      aria-busy={busy}
      className={`flex min-h-0 flex-1 flex-col ${className}`}
    >
      <div className="flex shrink-0 items-center gap-2 px-4 pt-4 pb-2">
        <h2 className="text-xs font-semibold tracking-wider text-brand-700 uppercase">
          {title}
        </h2>
        {busy ? (
          <span
            aria-hidden="true"
            className="size-1.5 animate-pulse rounded-full bg-brand-500"
          />
        ) : null}
        {selectedCount > 0 ? (
          <>
            <span className="rounded-full bg-brand-600 px-1.5 text-[11px] leading-5 font-semibold text-white tabular-nums">
              {selectedCount}
            </span>
            <button
              type="button"
              onClick={onClear}
              className={`ml-auto rounded text-xs font-medium text-brand-700 hover:text-brand-800 ${focusRing}`}
            >
              Clear
            </button>
          </>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  );
}

export type { Facet };

type FacetListProps = {
  items: Facet[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyLabel: string;
};

/**
 * Keeps checkbox order stable across refetches (API re-sorts by count).
 * Counts still update. Order resets when `resetKey` changes (e.g. search).
 * Selected values stay visible even if they drop out of the top 20.
 */
export function useStableFacets(
  facets: Facet[] | undefined,
  selected: string[],
  resetKey: string
): Facet[] {
  const orderRef = useRef<string[]>([]);
  const prevResetKey = useRef(resetKey);

  if (prevResetKey.current !== resetKey) {
    orderRef.current = [];
    prevResetKey.current = resetKey;
  }

  if (!facets) {
    return [];
  }

  const counts = new Map(facets.map((facet) => [facet.value, facet.count]));

  for (const facet of facets) {
    if (!orderRef.current.includes(facet.value)) {
      orderRef.current.push(facet.value);
    }
  }
  for (const value of selected) {
    if (!orderRef.current.includes(value)) {
      orderRef.current.push(value);
    }
  }

  orderRef.current = orderRef.current.filter(
    (value) => counts.has(value) || selected.includes(value)
  );

  return orderRef.current.map((value) => ({
    value,
    count: counts.get(value) ?? 0,
  }));
}

function FacetList({
  items,
  selected,
  onToggle,
  emptyLabel,
}: FacetListProps) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-2 text-sm text-slate-500">{emptyLabel}</p>
    );
  }

  return (
    <ul className="space-y-0.5 px-2 pb-3">
      {items.map((facet) => {
        const isSelected = selected.includes(facet.value);
        // A selected value can drop to 0 when other filters exclude it.
        // Keep it visible so it stays removable, but dim it as a dead end.
        const isEmpty = isSelected && facet.count === 0;
        return (
          <li key={facet.value}>
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                isSelected
                  ? "bg-brand-600 font-medium text-white shadow-sm shadow-brand-700/30"
                  : "text-slate-700 hover:bg-brand-100"
              } ${isEmpty ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(facet.value)}
                className={`size-4 shrink-0 cursor-pointer rounded ${
                  isSelected ? "accent-white" : "accent-brand-600"
                } ${focusRing}`}
              />
              <span className="min-w-0 flex-1 truncate">{facet.value}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-brand-100 text-brand-700"
                }`}
              >
                {isEmpty ? "no matches" : facet.count.toLocaleString()}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export type FacetGroupStatus = "loading" | "error" | "ready";

type FacetGroupProps = {
  title: string;
  status: FacetGroupStatus;
  /** True while newer counts are loading behind the ones on screen. */
  updating: boolean;
  onRetry: () => void;
  items: Facet[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  className?: string;
};

export function FacetGroup({
  title,
  status,
  updating,
  onRetry,
  items,
  selected,
  onToggle,
  onClear,
  className,
}: FacetGroupProps) {
  const noun = title.toLowerCase();

  return (
    <FacetSection
      title={title}
      selectedCount={selected.length}
      onClear={onClear}
      busy={status === "loading" || updating}
      className={className}
    >
      {status === "loading" ? (
        <FacetListSkeleton label={`Loading ${noun}…`} />
      ) : null}
      {status === "error" ? (
        <StatusMessage
          tone="error"
          action={{ label: "Retry", onClick: onRetry }}
          className="px-4 py-2"
        >
          Could not load {noun}.
        </StatusMessage>
      ) : null}
      {status === "ready" ? (
        <div
          className={`transition-opacity ${updating ? "opacity-60" : ""}`}
        >
          <FacetList
            items={items}
            selected={selected}
            onToggle={onToggle}
            emptyLabel={`No ${noun} for these filters.`}
          />
        </div>
      ) : null}
    </FacetSection>
  );
}
