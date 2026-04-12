import type { Dialect } from "kysely";
import { Kysely } from "kysely";

import { SqliteDialect } from "kysely";
import SQLite from "better-sqlite3";

import { PostgresDialect } from "kysely";
import pg from "pg";

import { MysqlDialect } from "kysely";
import mysql from "mysql2/promise";

import { env } from "@utils/env.js";
import type { Database } from "@schema/database.js";

export function getDialect(): Dialect {
  if (!env.DATABASE_TYPE) throw new Error("DATABASE_TYPE not set");
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL not set");

  switch (env.DATABASE_TYPE) {
    case "sqlite":
      const sqlite = new SQLite(env.DATABASE_URL);
      // Enable foreign key enforcement in SQLite
      sqlite.pragma("foreign_keys = ON");
      return new SqliteDialect({
        database: sqlite,
      });

    case "postgres":
      return new PostgresDialect({
        pool: new pg.Pool({ connectionString: env.DATABASE_URL }),
      });

    case "mysql":
      return new MysqlDialect({
        pool: mysql.createPool(env.DATABASE_URL),
      });

    default:
      throw new Error(`Unsupported DATABASE_TYPE: ${env.DATABASE_TYPE}`);
  }
}

export const db = new Kysely<Database>({
  dialect: getDialect(),
});
