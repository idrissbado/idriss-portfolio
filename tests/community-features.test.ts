import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("community features", () => {
  it("exposes the public forum page", () => {
    const routePath = path.resolve(__dirname, "../app/forum/page.tsx");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("Forum");
    expect(content).toContain("Discussion");
  });

  it("exposes the subscriber API endpoint", () => {
    const routePath = path.resolve(__dirname, "../app/api/subscribers/route.ts");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("export async function POST");
    expect(content).toContain("subscriber");
  });
});
