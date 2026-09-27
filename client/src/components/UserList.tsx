import { useVirtualizer } from "@tanstack/react-virtual";
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { User } from "../api/directory";
import { UserCardSkeleton } from "./Skeletons";
import { StatusMessage } from "./StatusMessage";
import { UserCard } from "./UserCard";

// Matches the old CSS grid: minmax(20rem, 1fr) with gap-3.
const CARD_MIN_WIDTH = 320;
const GAP = 12;
const ROW_HEIGHT_ESTIMATE = 96;
// Start the next request this many rows before the end.
const PREFETCH_ROWS = 5;

type UserListProps = {
  users: User[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
  /** Scrolls back to the top whenever this changes (new search, filter, or sort). */
  resetKey: string;
  dimmed: boolean;
};

function useColumnCount(ref: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setColumns(
        Math.max(1, Math.floor((width + GAP) / (CARD_MIN_WIDTH + GAP)))
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return columns;
}

export function UserList({
  users,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
  resetKey,
  dimmed,
}: UserListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount(scrollRef);
  const rowCount = Math.ceil(users.length / columns);
  const showFooter = hasNextPage || isFetchNextPageError;

  const virtualizer = useVirtualizer({
    count: showFooter ? rowCount + 1 : rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    gap: GAP,
    overscan: 4,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const lastVisibleIndex = virtualRows[virtualRows.length - 1]?.index ?? -1;

  useEffect(() => {
    if (
      lastVisibleIndex >= rowCount - PREFETCH_ROWS &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchNextPageError
    ) {
      onLoadMore();
    }
  }, [
    lastVisibleIndex,
    rowCount,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    onLoadMore,
  ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  return (
    <div
      ref={scrollRef}
      className={`h-full overflow-y-auto p-3 transition-opacity ${
        dimmed ? "opacity-60" : ""
      }`}
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualRows.map((row) => {
          const isFooter = row.index >= rowCount;
          const start = row.index * columns;

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              {isFooter ? (
                isFetchNextPageError ? (
                  <StatusMessage
                    tone="error"
                    action={{ label: "Retry", onClick: onLoadMore }}
                    className="px-1 py-2"
                  >
                    Could not load more people.
                  </StatusMessage>
                ) : (
                  <div
                    role="status"
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    <span className="sr-only">Loading more people…</span>
                    {Array.from({ length: columns }, (_, index) => (
                      <UserCardSkeleton key={index} />
                    ))}
                  </div>
                )
              ) : (
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                >
                  {users.slice(start, start + columns).map((user) => (
                    <UserCard key={user.id} {...user} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
