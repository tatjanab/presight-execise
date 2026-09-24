import { Router } from "express";
import { attachHobbies, countUsers, findUsers } from "../repositories/users.js";
import {
  SORT_FIELDS,
  type SortField,
  type SortOrder,
  type UserFilters,
  type UserSort,
  type UsersPage,
} from "../types.js";

export const usersRouter = Router();

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/** Reads a query value as a whole number of 1 or more. Missing or invalid values use fallback. */
function parsePositiveInt(
  value: unknown,
  fallback: number,
  max?: number
): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return fallback;
  return max === undefined ? n : Math.min(n, max);
}

const DEFAULT_SORT: SortField = "first_name";
const DEFAULT_ORDER: SortOrder = "asc";

/** Reads sort and order. Unknown values fall back to first_name ascending. */
function parseSort(query: Record<string, unknown>): UserSort {
  const field = SORT_FIELDS.find((name) => name === query.sort) ?? DEFAULT_SORT;
  const order: SortOrder = query.order === "desc" ? "desc" : DEFAULT_ORDER;
  return { field, order };
}

/** GET /api/users — one page of people for the current search, filters, and sort. */
usersRouter.get("/", (req, res) => {
  const filters = parseFilters(req.query);
  const sort = parseSort(req.query);
  const page = parsePositiveInt(req.query.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInt(
    req.query.pageSize,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );
  const offset = (page - 1) * pageSize;

  const total = countUsers(filters);
  const items = attachHobbies(
    findUsers({ filters, sort, limit: pageSize, offset })
  );

  const body: UsersPage = {
    items,
    page,
    pageSize,
    total,
    hasMore: offset + items.length < total,
    sort: sort.field,
    order: sort.order,
  };
  res.json(body);
});

/** Reads search, nationalities, and hobbies from the query string. */
export function parseFilters(query: Record<string, unknown>): UserFilters {
  return {
    search: typeof query.search === "string" ? query.search.trim() : "",
    nationalities: parseList(query.nationalities),
    hobbies: parseList(query.hobbies),
  };
}

/** Accepts ?x=a,b  and  ?x=a&x=b, trims, drops empties and duplicates. */
function parseList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : [value];
  const items = raw
    .filter((v): v is string => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
  return [...new Set(items)];
}
