import { getDb } from "../db.js";
import type { Facet, User, UserFilters, UserSort } from "../types.js";

type UserRow = Omit<User, "hobbies">;
type SqlParam = string | number;

interface WhereParts {
  clauses: string[];
  params: SqlParam[];
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => "?").join(",");
}

/** Make % and _ in user input match literally instead of acting as wildcards. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** Shared by the users list and the facets. */
export function buildWhere(filters: UserFilters): WhereParts {
  const clauses: string[] = [];
  const params: SqlParam[] = [];

  if (filters.search) {
    const pattern = `%${escapeLike(filters.search)}%`;
    clauses.push(`(
        u.first_name LIKE ? ESCAPE '\\'
        OR u.last_name LIKE ? ESCAPE '\\'
        OR (u.first_name || ' ' || u.last_name) LIKE ? ESCAPE '\\'
      )`);
    params.push(pattern, pattern, pattern);
  }

  // ANY of the selected nationalities
  if (filters.nationalities.length > 0) {
    clauses.push(
      `u.nationality IN (${placeholders(filters.nationalities.length)})`
    );
    params.push(...filters.nationalities);
  }
  // ALL of the selected hobbies
  if (filters.hobbies.length > 0) {
    clauses.push(`u.id IN (
        SELECT uh.user_id
        FROM user_hobbies uh
        JOIN hobbies h ON h.id = uh.hobby_id
        WHERE h.name IN (${placeholders(filters.hobbies.length)})
        GROUP BY uh.user_id
        HAVING COUNT(DISTINCT h.id) = ?
      )`);
    params.push(...filters.hobbies, filters.hobbies.length);
  }

  return { clauses, params };
}

function toWhereSql(clauses: string[]): string {
  return clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
}

// Column names cannot be bound with ?. The route only passes fields from this map.
const SORT_COLUMNS: Record<UserSort["field"], string> = {
  first_name: "u.first_name",
  last_name: "u.last_name",
  age: "u.age",
  nationality: "u.nationality",
};

function orderBySql(sort: UserSort): string {
  const column = SORT_COLUMNS[sort.field];
  const direction = sort.order === "desc" ? "DESC" : "ASC";
  // id uses the same direction so two people with the same name stay in a fixed order.
  return `ORDER BY ${column} ${direction}, u.id ${direction}`;
}

export function findUsers(params: {
  filters: UserFilters;
  sort: UserSort;
  limit: number;
  offset: number;
}): UserRow[] {
  const where = buildWhere(params.filters);

  // LIMIT is how many rows to return.
  // OFFSET is how many matching rows to skip before that.
  // Page 1 skips 0. Page 2 with pageSize 50 skips 50.
  return getDb()
    .prepare(
      `
    SELECT u.id, u.avatar, u.first_name, u.last_name, u.age, u.nationality
    FROM users u
    ${toWhereSql(where.clauses)}
    ${orderBySql(params.sort)}
    LIMIT ? OFFSET ?
  `
    )
    .all(...where.params, params.limit, params.offset) as unknown as UserRow[];
}

const TOP_FACETS = 20;

function readFacets(sql: string, filters: UserFilters): Facet[] {
  const where = buildWhere(filters);
  const rows = getDb()
    .prepare(sql)
    .all(...where.params) as unknown as { value: string; count: number }[];

  return rows.map((row) => ({ value: row.value, count: Number(row.count) }));
}

/** Top nationalities among people who match the current search and filters. */
export function findTopNationalities(filters: UserFilters): Facet[] {
  const where = buildWhere(filters);

  // GROUP BY collapses every matching person with the same nationality into one row.
  // COUNT(*) is how many people are in that group.
  return readFacets(
    `
    SELECT u.nationality AS value, COUNT(*) AS count
    FROM users u
    ${toWhereSql(where.clauses)}
    GROUP BY u.nationality
    ORDER BY count DESC, u.nationality ASC
    LIMIT ${TOP_FACETS}
  `,
    filters,
  );
}

/** Top hobbies among people who match the current search and filters. */
export function findTopHobbies(filters: UserFilters): Facet[] {
  const where = buildWhere(filters);

  // Join through user_hobbies so each of a person's hobbies is counted once.
  return readFacets(
    `
    SELECT h.name AS value, COUNT(*) AS count
    FROM users u
    JOIN user_hobbies uh ON uh.user_id = u.id
    JOIN hobbies h ON h.id = uh.hobby_id
    ${toWhereSql(where.clauses)}
    GROUP BY h.name
    ORDER BY count DESC, h.name ASC
    LIMIT ${TOP_FACETS}
  `,
    filters,
  );
}

export function countUsers(filters: UserFilters): number {
  const where = buildWhere(filters);
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS count FROM users u ${toWhereSql(where.clauses)}`
    )
    .get(...where.params) as { count: number };
  return row.count;
}

export function attachHobbies(rows: UserRow[]): User[] {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const hobbyRows = getDb()
    .prepare(
      `
        SELECT uh.user_id, h.name
        FROM user_hobbies uh
        JOIN hobbies h ON h.id = uh.hobby_id
        WHERE uh.user_id IN (${ids.map(() => "?").join(",")})
        ORDER BY h.name
      `
    )
    .all(...ids) as unknown as { user_id: number; name: string }[];

  const byUser = new Map<number, string[]>();
  for (const { user_id, name } of hobbyRows) {
    const list = byUser.get(user_id);
    if (list) list.push(name);
    else byUser.set(user_id, [name]);
  }

  return rows.map((r) => ({ ...r, hobbies: byUser.get(r.id) ?? [] }));
}
