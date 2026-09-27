const bar = "animate-pulse rounded-full bg-brand-100";

/** Same shape and size as UserCard, so the layout doesn't jump when data arrives. */
export function UserCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-w-0 gap-3 rounded-xl border border-brand-100 bg-white p-3.5 shadow-sm shadow-brand-900/5"
    >
      <div className="size-12 shrink-0 animate-pulse rounded-full bg-brand-100 ring-2 ring-brand-100 ring-offset-2" />
      <div className="min-w-0 flex-1">
        <div className={`${bar} mt-1 h-4 w-2/3`} />
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className={`${bar} h-3 w-1/3`} />
          <div className={`${bar} h-3 w-6`} />
        </div>
        <div className="mt-3.5 flex gap-1.5">
          <div className={`${bar} h-5 w-16`} />
          <div className={`${bar} h-5 w-12`} />
        </div>
      </div>
    </div>
  );
}

export function UserGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div role="status" className="p-3">
      <span className="sr-only">Loading people…</span>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-3">
        {Array.from({ length: count }, (_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

// Varied widths so the placeholder reads as a list of different names.
const FACET_WIDTHS = ["w-24", "w-16", "w-28", "w-20", "w-14", "w-24"];

export function FacetListSkeleton({ label }: { label: string }) {
  return (
    <div role="status" className="space-y-0.5 px-2 pb-3">
      <span className="sr-only">{label}</span>
      {FACET_WIDTHS.map((width, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex items-center gap-2.5 px-2.5 py-2"
        >
          <div className="size-4 shrink-0 animate-pulse rounded bg-brand-100" />
          <div className={`${bar} h-3 ${width}`} />
          <div className={`${bar} ml-auto h-4 w-8`} />
        </div>
      ))}
    </div>
  );
}
