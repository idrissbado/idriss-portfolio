import { describe, expect, it } from "vitest";

describe("admin auth flow", () => {
  it("exposes the NextAuth route used by the admin login page", async () => {
    const route = await import("../app/api/auth/[...nextauth]/route");

    expect(route.GET).toBeDefined();
    expect(route.POST).toBeDefined();
  });

  it("uses the admin login page as the sign-in entrypoint", async () => {
    const { authOptions } = await import("../lib/auth");

    expect(authOptions.pages?.signIn).toBe("/login");
  });
});
