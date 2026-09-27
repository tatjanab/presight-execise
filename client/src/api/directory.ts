import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { type DirectoryState, toSearchParams } from "../directoryState";

export type User = {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
};

export type UsersPage = {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  sort: string;
  order: string;
};

export type Facet = {
  value: string;
  count: number;
};

export type FacetsResponse = {
  hobbies: Facet[];
  nationalities: Facet[];
};

async function getJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export function fetchUsers(
  filters: DirectoryState,
  page = 1
): Promise<UsersPage> {
  const params = toSearchParams(filters);
  params.set("page", String(page));
  return getJson(`/api/users?${params}`, "Could not load people");
}

export function fetchFacets(filters: DirectoryState): Promise<FacetsResponse> {
  const params = toSearchParams(filters);
  return getJson(`/api/facets?${params}`, "Could not load filters");
}

export function useUsersQuery(filters: DirectoryState) {
  return useInfiniteQuery({
    queryKey: ["users", filters],
    queryFn: ({ pageParam }) => fetchUsers(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useFacetsQuery(filters: DirectoryState) {
  return useQuery({
    queryKey: ["facets", filters],
    queryFn: () => fetchFacets(filters),
    // Keep the previous sidebar visible while the next filter response loads.
    placeholderData: keepPreviousData,
  });
}
