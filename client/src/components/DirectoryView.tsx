import { useCallback, useMemo } from "react";
import { useFacetsQuery, useUsersQuery } from "../api/directory";
import {
  toggleInList,
  useDirectoryState,
} from "../directoryState";
import {
  FacetGroup,
  type FacetGroupStatus,
  useStableFacets,
} from "./FacetList";
import { UserGridSkeleton } from "./Skeletons";
import { UserList } from "./UserList";
import { SearchField } from "./SearchField";
import { SortControls } from "./SortControls";
import { StatusMessage } from "./StatusMessage";

export function DirectoryView() {
  const [filters, updateFilters] = useDirectoryState();
  const users = useUsersQuery(filters);
  const facets = useFacetsQuery(filters);

  // Reset row order when search changes; keep it steady while toggling filters.
  const hobbyFacets = useStableFacets(
    facets.data?.hobbies,
    filters.hobbies,
    filters.search
  );
  const nationalityFacets = useStableFacets(
    facets.data?.nationalities,
    filters.nationalities,
    filters.search
  );

  const hasActiveFilters =
    filters.search !== "" ||
    filters.hobbies.length > 0 ||
    filters.nationalities.length > 0;
  const clearFilters = () =>
    updateFilters({ search: "", hobbies: [], nationalities: [] });
  const retryFacets = () => void facets.refetch();
  // A retry keeps the error status while it runs, so check isFetching first.
  const facetStatus: FacetGroupStatus =
    facets.isError && !facets.isFetching
      ? "error"
      : facets.data
        ? "ready"
        : "loading";

  const people = useMemo(
    () => users.data?.pages.flatMap((page) => page.items) ?? [],
    [users.data]
  );
  const total = users.data?.pages[0]?.total;
  const { fetchNextPage } = users;
  // cancelRefetch: false so a repeat call doesn't abort the page already loading.
  const loadMore = useCallback(
    () => void fetchNextPage({ cancelRefetch: false }),
    [fetchNextPage]
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-brand-100/70 text-slate-900">
      <header className="shrink-0 bg-linear-to-r from-brand-700 via-brand-600 to-violet-500 px-4 py-4 text-white shadow-md shadow-brand-900/20 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-lg bg-white/15 text-white ring-1 ring-white/25"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="size-5"
            >
              <circle cx="7.5" cy="7" r="2.75" />
              <path d="M2.5 16c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" />
              <circle cx="14" cy="7.5" r="2.25" />
              <path d="M14 12c1.9 0 3.2 1.1 3.6 3.2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg leading-tight font-semibold tracking-tight">
              User directory
            </h1>
            <p className="text-sm text-brand-100">
              Search, filter and sort people
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <div className="min-w-0 flex-1">
            <SearchField value={filters.search} onChange={(value) => updateFilters({ search: value })} />
          </div>
          <SortControls
            sort={filters.sort}
            order={filters.order}
            onChange={(patch) => updateFilters(patch)}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          aria-label="Filters"
          className="flex max-h-[46%] min-h-0 shrink-0 flex-col border-b border-brand-200/70 bg-brand-50 md:max-h-none md:w-72 md:border-r md:border-b-0"
        >
          <FacetGroup
            title="Hobbies"
            status={facetStatus}
            updating={facets.isFetching}
            onRetry={retryFacets}
            items={hobbyFacets}
            selected={filters.hobbies}
            onToggle={(value) =>
              updateFilters({ hobbies: toggleInList(filters.hobbies, value) })
            }
            onClear={() => updateFilters({ hobbies: [] })}
            className="border-b border-brand-200/70"
          />
          <FacetGroup
            title="Nationalities"
            status={facetStatus}
            updating={facets.isFetching}
            onRetry={retryFacets}
            items={nationalityFacets}
            selected={filters.nationalities}
            onToggle={(value) =>
              updateFilters({
                nationalities: toggleInList(filters.nationalities, value),
              })
            }
            onClear={() => updateFilters({ nationalities: [] })}
          />
        </aside>

        <main className="min-h-0 flex-1 p-4 sm:p-6">
          <section
            aria-label="People"
            aria-busy={users.isFetching}
            className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-brand-200/70 bg-brand-50/80 shadow-sm shadow-brand-900/5"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-200/70 bg-linear-to-r from-brand-100 to-violet-100 px-4 py-3">
              <h2 className="font-semibold text-brand-900">People</h2>
              {users.isPlaceholderData ? (
                <p className="flex items-center gap-1.5 text-xs font-medium text-brand-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
                  Updating…
                </p>
              ) : total !== undefined ? (
                <p className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-medium text-white tabular-nums shadow-sm">
                  {total.toLocaleString()} found
                </p>
              ) : null}
            </div>
            <div className="min-h-0 flex-1">
              {people.length > 0 ? (
                <UserList
                  users={people}
                  hasNextPage={users.hasNextPage}
                  isFetchingNextPage={users.isFetchingNextPage}
                  isFetchNextPageError={users.isFetchNextPageError}
                  onLoadMore={loadMore}
                  resetKey={JSON.stringify(filters)}
                  dimmed={users.isPlaceholderData}
                />
              ) : (
                <>
                  {/* isFetching also covers a retry after an error and a refetch
                      that starts from an empty previous result. */}
                  {users.isPending || users.isFetching ? (
                    <UserGridSkeleton />
                  ) : null}
                  {users.isError && !users.isFetching ? (
                    <StatusMessage
                      tone="error"
                      action={{
                        label: "Retry",
                        onClick: () => void users.refetch(),
                      }}
                      className="px-4 py-5"
                    >
                      Could not load people.
                    </StatusMessage>
                  ) : null}
                  {users.isSuccess && !users.isFetching ? (
                    <StatusMessage
                      action={
                        hasActiveFilters
                          ? { label: "Clear filters", onClick: clearFilters }
                          : undefined
                      }
                      className="px-4 py-5"
                    >
                      No people match these filters.
                    </StatusMessage>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
