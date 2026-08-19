import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("teaching route", () => {
  it("should exist and contain the teaching page component", () => {
    const routePath = path.resolve(__dirname, "../app/teaching/page.tsx");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("Teaching");
    expect(content).toContain("export default function");
  });
});
