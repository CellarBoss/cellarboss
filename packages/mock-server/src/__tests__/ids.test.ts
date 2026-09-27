import { describe, it, expect } from "vitest";
import { nextId, nextPrefixedId } from "../ids";

describe("nextId", () => {
  it("returns 1 for an empty collection", () => {
    expect(nextId([])).toBe(1);
  });

  it("returns one more than the highest existing id", () => {
    expect(nextId([{ id: 3 }, { id: 7 }, { id: 5 }])).toBe(8);
  });

  it("ignores gaps left by deleted rows below the maximum", () => {
    expect(nextId([{ id: 1 }, { id: 4 }])).toBe(5);
  });

  it("does not reissue the id of a deleted row", () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const id = nextId(rows);
    rows.push({ id });
    rows.pop();

    expect(nextId(rows)).toBe(id + 1);
  });

  it("starts afresh for a replacement collection", () => {
    nextId([{ id: 9 }]);
    expect(nextId([{ id: 1 }])).toBe(2);
  });
});

describe("nextPrefixedId", () => {
  it("returns one more than the highest matching id", () => {
    const rows = [{ id: "user-2" }, { id: "admin-user-1" }, { id: "user-x" }];
    expect(nextPrefixedId(rows, "user-")).toBe("user-3");
  });

  it("does not reissue the id of a deleted row", () => {
    const rows = [{ id: "user-1" }];
    const id = nextPrefixedId(rows, "user-");
    rows.push({ id });
    rows.pop();

    expect(nextPrefixedId(rows, "user-")).toBe("user-3");
  });
});
