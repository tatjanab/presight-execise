import { useEffect, useState } from "react";

export const SORT_FIELDS = [
  "first_name",
  "last_name",
  "age",
  "nationality",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortOrder = "asc" | "desc";

export type DirectoryState = {
  search: string;
  hobbies: string[];
  nationalities: string[];
  sort: SortField;
  order: SortOrder;
};

const DEFAULT_STATE: DirectoryState = {
  search: "",
  hobbies: [],
  nationalities: [],
  sort: "first_name",
  order: "asc",
};

function parseList(value: string | null): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ];
}

export function parseDirectoryState(params: URLSearchParams): DirectoryState {
  const sort = params.get("sort");
  const field = SORT_FIELDS.find((name) => name === sort) ?? DEFAULT_STATE.sort;

  return {
    search: (params.get("search") ?? "").trim(),
    hobbies: parseList(params.get("hobbies")),
    nationalities: parseList(params.get("nationalities")),
    sort: field,
    order: params.get("order") === "desc" ? "desc" : DEFAULT_STATE.order,
  };
}

/** Builds query params for the URL and API. Omits defaults to keep URLs short. */
export function toSearchParams(state: DirectoryState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.search) params.set("search", state.search);
  if (state.hobbies.length > 0) params.set("hobbies", state.hobbies.join(","));
  if (state.nationalities.length > 0) {
    params.set("nationalities", state.nationalities.join(","));
  }
  if (state.sort !== DEFAULT_STATE.sort) params.set("sort", state.sort);
  if (state.order !== DEFAULT_STATE.order) params.set("order", state.order);

  return params;
}

export function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

type HistoryMode = "push" | "replace";

function writeUrl(state: DirectoryState, mode: HistoryMode): void {
  const qs = toSearchParams(state).toString();
  const url = qs ? `?${qs}` : window.location.pathname;
  if (mode === "replace") {
    window.history.replaceState(null, "", url);
  } else {
    window.history.pushState(null, "", url);
  }
}

export function useDirectoryState() {
  const [state, setState] = useState(() =>
    parseDirectoryState(new URLSearchParams(window.location.search))
  );

  useEffect(() => {
    const onPopState = () => {
      setState(parseDirectoryState(new URLSearchParams(window.location.search)));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function update(
    patch: Partial<DirectoryState>,
    mode: HistoryMode = "push"
  ): void {
    setState((prev) => {
      const next = { ...prev, ...patch };
      writeUrl(next, mode);
      return next;
    });
  }

  return [state, update] as const;
}
