import { describe, expect, it } from "vitest";
import { initialRunnerView } from "~/lib/sandbox/runner-view";
import { DataTablesRunner } from "~/lib/sandbox/runners/data";
import { SqlJsRunner } from "~/lib/sandbox/runners/sqljs";

describe("sandbox panel runner tab", () => {
  it("opens data tables on the Tables tab on the first run", () => {
    expect(initialRunnerView(DataTablesRunner)).toBe("tables");
  });

  it("opens existing SQL runners on Console", () => {
    expect(initialRunnerView(SqlJsRunner)).toBe("console");
  });

  it("does not select Tables for a runner without table support", () => {
    expect(initialRunnerView({ defaultTab: "tables", tables: false })).toBe("console");
  });
});
