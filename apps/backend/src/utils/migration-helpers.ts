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
 * Usage:
 *   import { addIdColumn, shortText, decimal } from "@utils/migration-helpers.js";
 *
 *   await addIdColumn(db.schema.createTable("widget"))
 *     .addColumn("name", shortText(), (col) => col.notNull())
 *     .addColumn("price", decimal(), (col) => col.notNull())
 *     .execute();
 */

type Dialect = "sqlite" | "postgres" | "mysql";

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
): CreateTableBuilder<TB, C | "id"> {
  if (dialect === "postgres") {
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
export function shortText() {
  return dialect === "mysql" ? sql`varchar(255)` : sql`text`;
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
export function boolean() {
  if (dialect === "postgres") return sql`boolean`;
  if (dialect === "mysql") return sql`tinyint(1)`;
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
export function timestamp() {
  if (dialect === "postgres") return sql`timestamptz`;
  if (dialect === "mysql") return sql`datetime(3)`;
  return sql`text`;
}

/**
 * JSON column.
 *
 * - postgres: jsonb (indexable, binary storage)
 * - mysql:    json
 * - sqlite:   text (caller must JSON.parse / JSON.stringify)
 */
export function json() {
  if (dialect === "postgres") return sql`jsonb`;
  if (dialect === "mysql") return sql`json`;
  return sql`text`;
}

/**
 * SQL expression for "current timestamp", suitable for use as a column
 * default. Resolves to `CURRENT_TIMESTAMP` on all three dialects.
 */
export function nowDefault() {
  return sql`CURRENT_TIMESTAMP`;
}
