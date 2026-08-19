import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("contact API route", () => {
  it("should exist and expose a POST handler", () => {
    const routePath = path.resolve(__dirname, "../app/api/contact/route.ts");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("export async function POST");
    expect(content).toContain("resend");
  });
});
