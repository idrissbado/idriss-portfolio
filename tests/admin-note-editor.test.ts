import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("admin note editor routing", () => {
  it("loads and saves a note through its dynamic item endpoint", () => {
    const editorPath = path.resolve(__dirname, "../app/admin/(protected)/notes/[id]/edit/page.tsx");
    const content = readFileSync(editorPath, "utf8");

    expect(content).toContain("/api/admin/notes/${encodeURIComponent(noteId)}");
    expect(content).not.toContain("/api/admin/notes?id=");
  });

  it("reads the note identifier from the Next.js route params", () => {
    const routePath = path.resolve(__dirname, "../app/api/admin/notes/[id]/route.ts");
    const content = readFileSync(routePath, "utf8");

    expect(content).toContain("params: Promise<{ id: string }>");
    expect(content).toContain("await context.params");
    expect(content).not.toContain('searchParams.get("id")');
  });
});
