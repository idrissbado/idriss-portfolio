import { describe, expect, it } from "vitest";
import {
  getNicknameValidationError,
  getPrivateFallbackNickname,
  normalizeNickname,
} from "../lib/nickname";

describe("nickname privacy helpers", () => {
  it("normalizes nicknames for case-insensitive first-claim ownership", () => {
    expect(normalizeNickname("  Math_Explorer  ")).toBe("math_explorer");
  });

  it("accepts safe public nicknames and rejects unsafe ones", () => {
    expect(getNicknameValidationError("math-explorer")).toBeNull();
    expect(getNicknameValidationError("ab")).toContain("between 3 and 24");
    expect(getNicknameValidationError("private name")).toContain("lowercase letters");
    expect(getNicknameValidationError("-starts-wrong")).toContain("starting with");
  });

  it("creates a public fallback without exposing a name or email", () => {
    const nickname = getPrivateFallbackNickname("user-secret-id-123456");
    expect(nickname).toMatch(/^member-[a-z0-9]+$/);
    expect(nickname).not.toContain("@");
  });
});
