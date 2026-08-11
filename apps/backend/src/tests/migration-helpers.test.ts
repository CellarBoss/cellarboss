import { describe, it, expect } from "vitest";
import { Kysely, SqliteDialect, type RawBuilder } from "kysely";
import SQLite from "better-sqlite3";
import {
  addIdColumn,
  shortText,
  longText,
  boolean,
  decimal,
  timestamp,
  json,
  nowDefault,
} from "@utils/migration-helpers.js";

// Extracts the literal SQL fragment kysely's `sql` tag would compile, without
// needing a real connection or query compiler.
function rawSql(builder: RawBuilder<unknown>): string {
  return (
    builder.toOperationNode() as { sqlFragments: string[] }
  ).sqlFragments.join("");
}

const db = new Kysely<any>({
  dialect: new SqliteDialect({ database: new SQLite(":memory:") }),
});

describe("shortText", () => {
  it("uses varchar(255) on mysql", () => {
    expect(rawSql(shortText("mysql"))).toBe("varchar(255)");
  });

  it("uses text on postgres", () => {
    expect(rawSql(shortText("postgres"))).toBe("text");
  });

  it("uses text on sqlite", () => {
    expect(rawSql(shortText("sqlite"))).toBe("text");
  });
});

describe("longText", () => {
  it("always resolves to text", () => {
    expect(rawSql(longText())).toBe("text");
  });
});

describe("boolean", () => {
  it("uses boolean on postgres", () => {
    expect(rawSql(boolean("postgres"))).toBe("boolean");
  });

  it("uses tinyint(1) on mysql", () => {
    expect(rawSql(boolean("mysql"))).toBe("tinyint(1)");
  });

  it("uses integer on sqlite", () => {
    expect(rawSql(boolean("sqlite"))).toBe("integer");
  });
});

describe("timestamp", () => {
  it("uses timestamptz on postgres", () => {
    expect(rawSql(timestamp("postgres"))).toBe("timestamptz");
  });

  it("uses datetime(3) on mysql", () => {
    expect(rawSql(timestamp("mysql"))).toBe("datetime(3)");
  });

  it("uses text on sqlite", () => {
    expect(rawSql(timestamp("sqlite"))).toBe("text");
  });
});

describe("json", () => {
  it("uses jsonb on postgres", () => {
    expect(rawSql(json("postgres"))).toBe("jsonb");
  });

  it("uses json on mysql", () => {
    expect(rawSql(json("mysql"))).toBe("json");
  });

  it("uses text on sqlite", () => {
    expect(rawSql(json("sqlite"))).toBe("text");
  });
});

describe("decimal", () => {
  it("defaults to precision 12, scale 2", () => {
    expect(rawSql(decimal())).toBe("numeric(12, 2)");
  });

  it("accepts custom precision and scale", () => {
    expect(rawSql(decimal(5, 1))).toBe("numeric(5, 1)");
  });
});

describe("nowDefault", () => {
  it("resolves to CURRENT_TIMESTAMP", () => {
    expect(rawSql(nowDefault())).toBe("CURRENT_TIMESTAMP");
  });
});

describe("addIdColumn", () => {
  it("uses SERIAL primary key on postgres", () => {
    const node = addIdColumn(
      db.schema.createTable("widget"),
      "id",
      "postgres",
    ).toOperationNode();
    const [column] = node.columns;

    expect(column.dataType).toEqual({
      kind: "DataTypeNode",
      dataType: "serial",
    });
    expect(column.primaryKey).toBe(true);
    expect(column.autoIncrement).toBeUndefined();
  });

  it("uses an autoincrement integer primary key on sqlite", () => {
    const node = addIdColumn(
      db.schema.createTable("widget"),
      "id",
      "sqlite",
    ).toOperationNode();
    const [column] = node.columns;

    expect(column.dataType).toEqual({
      kind: "DataTypeNode",
      dataType: "integer",
    });
    expect(column.primaryKey).toBe(true);
    expect(column.autoIncrement).toBe(true);
  });

  it("uses an autoincrement integer primary key on mysql", () => {
    const node = addIdColumn(
      db.schema.createTable("widget"),
      "id",
      "mysql",
    ).toOperationNode();
    const [column] = node.columns;

    expect(column.dataType).toEqual({
      kind: "DataTypeNode",
      dataType: "integer",
    });
    expect(column.primaryKey).toBe(true);
    expect(column.autoIncrement).toBe(true);
  });

  it("defaults the column name to 'id'", () => {
    const node = addIdColumn(
      db.schema.createTable("widget"),
      undefined,
      "sqlite",
    ).toOperationNode();

    expect(node.columns[0].column.column.name).toBe("id");
  });

  it("accepts a custom column name", () => {
    const node = addIdColumn(
      db.schema.createTable("widget"),
      "widgetId",
      "sqlite",
    ).toOperationNode();

    expect(node.columns[0].column.column.name).toBe("widgetId");
  });
});
