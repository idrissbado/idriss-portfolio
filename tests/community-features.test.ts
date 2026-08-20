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

  it("supports a public login flow for community members", () => {
    const loginPath = path.resolve(__dirname, "../app/login/page.tsx");
    expect(existsSync(loginPath)).toBe(true);

    const content = readFileSync(loginPath, "utf8");
    expect(content).toContain("signIn");
    expect(content).toContain("Create account");
  });

  it("supports a public registration flow for forum users", () => {
    const registerPath = path.resolve(__dirname, "../app/register/page.tsx");
    expect(existsSync(registerPath)).toBe(true);

    const content = readFileSync(registerPath, "utf8");
    expect(content).toContain("Create account");
    expect(content).toContain("register");
  });

  it("supports email verification before login", () => {
    const verifyPath = path.resolve(__dirname, "../app/verify-email/page.tsx");
    expect(existsSync(verifyPath)).toBe(true);

    const content = readFileSync(verifyPath, "utf8");
    expect(content).toContain("verify");
    expect(content).toContain("token");
  });

  it("includes a public Ask question composer with LaTeX guidance", () => {
    const forumClientPath = path.resolve(__dirname, "../components/forum/forum-page-client.tsx");
    expect(existsSync(forumClientPath)).toBe(true);

    const content = readFileSync(forumClientPath, "utf8");
    expect(content).toContain("Ask question");
    expect(content).toContain("textarea");
    expect(content).toContain("LaTeX");
    expect(content).toContain("MathRenderer");
  });

  it("does not ship placeholder forum topic data", () => {
    const storePath = path.resolve(__dirname, "../lib/community-store.ts");
    const content = readFileSync(storePath, "utf8");

    expect(content).not.toContain("Introductions and community goals");
    expect(content).not.toContain("Reading list for math and data science");
  });

  it("exposes the subscriber API endpoint", () => {
    const routePath = path.resolve(__dirname, "../app/api/subscribers/route.ts");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("export async function POST");
    expect(content).toContain("subscriber");
  });
});
