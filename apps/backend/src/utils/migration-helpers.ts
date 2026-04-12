import { sql } from "kysely";
import type { CreateTableBuilder } from "kysely";
import { env } from "./env.js";

/**
 * Dialect-aware helpers for use in migrations.
 *
 * The application supports SQLite, PostgreSQL and MySQL. Most schema concepts
 * (FKs, indexes, NOT NULL, etc.) work identically across all three via Kysely,
 * but type names, auto-increment syntax, defaults on TEXT, and a handful of
 * other concerns differ. Centralise the differences here so individual
 * migrations stay declarative.
 *
 * Every helper accepts an optional `dialect` parameter that defaults to the
 * current DATABASE_TYPE env var. Pass it explicitly when you need to generate
 * schema for a specific dialect (e.g. in tests or migration tooling).
 *
 * Usage:
 *   import { addIdColumn, shortText, decimal } from "@utils/migration-helpers.js";
 *
 *   await addIdColumn(db.schema.createTable("widget"))
 *     .addColumn("name", shortText(), (col) => col.notNull())
 *     .addColumn("price", decimal(), (col) => col.notNull())
 *     .execute();
 *
 * ## Coercion rules (read-side)
 *
 * Several column types return different JS shapes depending on the database
 * driver. Application code MUST coerce values when reading these columns.
 * Coercion utilities are in `@utils/query-helpers.js`.
 *
 * | Column helper | SQLite         | PostgreSQL      | MySQL           | Coerce with        |
 * |---------------|----------------|-----------------|-----------------|--------------------|
 * | boolean()     | number (0/1)   | boolean         | number (0/1)    | toBool(value)      |
 * | decimal()     | number         | string          | string          | toNumber(value)    |
 * | timestamp()   | string (ISO)   | Date            | Date            | toISOString(value) |
 * | json()        | string         | object          | object          | JSON.parse if str  |
 *
 * Columns using shortText() / longText() / "integer" are consistent across all
 * dialects and do not require coercion.
 */

export type Dialect = "sqlite" | "postgres" | "mysql";

export const dialect: Dialect = env.DATABASE_TYPE;

/**
 * Adds an auto-incrementing integer primary key column to a CREATE TABLE
 * builder.
 *
 * - sqlite:   INTEGER PRIMARY KEY AUTOINCREMENT
 * - mysql:    INTEGER AUTO_INCREMENT PRIMARY KEY
 * - postgres: SERIAL PRIMARY KEY
 *
 * Postgres does not understand the AUTO_INCREMENT syntax that Kysely's
 * `.autoIncrement()` emits, so it needs the SERIAL pseudo-type instead.
 */
export function addIdColumn<TB extends string, C extends string = never>(
  table: CreateTableBuilder<TB, C>,
  name = "id",
  d: Dialect = dialect,
): CreateTableBuilder<TB, C | "id"> {
  if (d === "postgres") {
    return table.addColumn(name, "serial", (col) =>
      col.primaryKey(),
    ) as CreateTableBuilder<TB, C | "id">;
  }
  return table.addColumn(name, "integer", (col) =>
    col.primaryKey().autoIncrement(),
  ) as CreateTableBuilder<TB, C | "id">;
}

/**
 * Short variable-length string suitable for indexing, defaults, and primary
 * keys.
 *
 * - mysql:    varchar(255) — TEXT cannot have defaults and cannot be indexed
 *             without specifying a key length, so we always use varchar for
 *             "short" string columns.
 * - postgres: text
 * - sqlite:   text
 *
 * Use for names, codes, statuses, slugs, ISO date strings, and any column
 * that participates in an index, unique constraint, or has a default value.
 */
export function shortText(d: Dialect = dialect) {
  return d === "mysql" ? sql`varchar(255)` : sql`text`;
}

/**
 * Long-form text (descriptions, tasting notes, JSON-as-string blobs).
 *
 * Resolves to TEXT on all dialects. Note that on MySQL, TEXT columns cannot
 * have a default value and cannot be part of an index without a key length —
 * use {@link shortText} for those cases.
 */
export function longText() {
  return sql`text`;
}

/**
 * Boolean column type.
 *
 * - postgres: boolean        → JS boolean
 * - mysql:    tinyint(1)     → JS number (0/1) via mysql2 by default
 * - sqlite:   integer        → JS number (0/1)
 *
 * Because the JS shape differs across dialects, application code that reads
 * boolean columns should coerce with `Boolean(value)` rather than relying on
 * the driver. Schema types should reflect this (e.g. `ColumnType<number,
 * number | undefined, number>`).
 */
export function boolean(d: Dialect = dialect) {
  if (d === "postgres") return sql`boolean`;
  if (d === "mysql") return sql`tinyint(1)`;
  return sql`integer`;
}

/**
 * Fixed-point decimal column for monetary values and other exact numbers.
 * All three dialects support `numeric(p, s)`.
 *
 * Defaults to (12, 2) — ten digits before the decimal point, two after,
 * which fits any realistic price.
 */
export function decimal(precision = 12, scale = 2) {
  return sql.raw(`numeric(${precision}, ${scale})`);
}

/**
 * Native timestamp column with millisecond precision.
 *
 * - postgres: timestamptz
 * - mysql:    datetime(3)
 * - sqlite:   text (ISO 8601)
 *
 * Drivers return Date objects on Postgres/MySQL and strings on SQLite, so
 * application code must normalise on read. If you need a single consistent
 * shape across dialects, store ISO strings in a {@link shortText} column
 * instead.
 */
export function timestamp(d: Dialect = dialect) {
  if (d === "postgres") return sql`timestamptz`;
  if (d === "mysql") return sql`datetime(3)`;
  return sql`text`;
}

/**
 * JSON column.
 *
 * - postgres: jsonb (indexable, binary storage)
 * - mysql:    json
 * - sqlite:   text (caller must JSON.parse / JSON.stringify)
 */
export function json(d: Dialect = dialect) {
  if (d === "postgres") return sql`jsonb`;
  if (d === "mysql") return sql`json`;
  return sql`text`;
}

/**
 * SQL expression for "current timestamp", suitable for use as a column
 * default. Resolves to `CURRENT_TIMESTAMP` on all three dialects.
 */
export function nowDefault() {
  return sql`CURRENT_TIMESTAMP`;
}
