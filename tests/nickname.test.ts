import { describe, expect, it } from "vitest";
import {
  getNicknameValidationError,
  getPrivateFallbackNickname,
  isGeneratedNickname,
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
    expect(getNicknameValidationError("member-copycat")).toContain("reserved");
  });

  it("creates a public fallback without exposing a name or email", () => {
    const nickname = getPrivateFallbackNickname("user-secret-id-123456");
    expect(nickname).toMatch(/^member-[a-z0-9]+$/);
    expect(nickname).not.toContain("@");
    expect(isGeneratedNickname(nickname)).toBe(true);
    expect(isGeneratedNickname("math-explorer")).toBe(false);
  });
});
