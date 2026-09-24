export interface User {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface UserFilters {
  search: string;
  nationalities: string[];
  hobbies: string[];
}

export const SORT_FIELDS = [
  "first_name",
  "last_name",
  "age",
  "nationality",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export interface UserSort {
  field: SortField;
  order: SortOrder;
}

export interface Facet {
  value: string;
  count: number;
}

export interface Facets {
  hobbies: Facet[];
  nationalities: Facet[];
}

export interface UsersPage {
  items: User[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  sort: SortField;
  order: SortOrder;
}
