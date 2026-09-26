import type { Kysely } from "kysely";

/**
 * A database shape with no compile-time knowledge of its tables or columns.
 *
 * Migrations, seeds and Better Auth's tables must not depend on the app's
 * current schema types (a migration has to keep working after the schema it
 * created has since changed), so they query through this instead of
 * `Database`. Every column reads back as `unknown` and must be narrowed.
 */
export type UntypedDatabase = Record<string, Record<string, unknown>>;

export type UntypedKysely = Kysely<UntypedDatabase>;
