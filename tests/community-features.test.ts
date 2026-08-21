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

  it("supports image attachments in the question composer", () => {
    const forumClientPath = path.resolve(__dirname, "../components/forum/forum-page-client.tsx");
    const content = readFileSync(forumClientPath, "utf8");

    expect(content).toContain("Browse");
    expect(content).toContain("drag");
    expect(content).toContain("imageUrl");
    expect(content).toContain("onPaste");
  });

  it("connects forum navigation to real filtering behavior", () => {
    const forumClientPath = path.resolve(__dirname, "../components/forum/forum-page-client.tsx");
    const content = readFileSync(forumClientPath, "utf8");

    expect(content).toContain("activeNav");
    expect(content).toContain("topic.replies.length === 0");
    expect(content).toContain("setActiveNav");
    expect(content).toContain("Users");
  });

  it("does not ship placeholder forum topic data", () => {
    const storePath = path.resolve(__dirname, "../lib/community-store.ts");
    const content = readFileSync(storePath, "utf8");

    expect(content).not.toContain("Introductions and community goals");
    expect(content).not.toContain("Reading list for math and data science");
  });

  it("removes placeholder public-site text and example URLs", () => {
    const cvPath = path.resolve(__dirname, "../app/cv/page.tsx");
    const layoutPath = path.resolve(__dirname, "../app/layout.tsx");
    const academicDataPath = path.resolve(__dirname, "../lib/academic-data.ts");

    const cvContent = readFileSync(cvPath, "utf8");
    const layoutContent = readFileSync(layoutPath, "utf8");
    const academicDataContent = readFileSync(academicDataPath, "utf8");

    expect(cvContent).not.toContain("Placeholder academic background");
    expect(cvContent).not.toContain("To be updated in the administration system.");
    expect(layoutContent).not.toContain("https://example.com");
    expect(academicDataContent).not.toContain("https://example.com");
  });

  it("allows an author to edit an existing question", () => {
    const routePath = path.resolve(__dirname, "../app/api/forum/[slug]/route.ts");
    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("PATCH");
    expect(content).toContain("updateForumTopic");
    expect(content).toContain("editorEmail");
  });

  it("allows an author to delete an existing question", () => {
    const routePath = path.resolve(__dirname, "../app/api/forum/[slug]/route.ts");
    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("DELETE");
    expect(content).toContain("deleteForumTopic");
    expect(content).toContain("authorEmail");
  });

  it("allows an author to edit or delete an answer", () => {
    const routePath = path.resolve(__dirname, "../app/api/forum/[slug]/replies/[replyId]/route.ts");
    const threadPath = path.resolve(__dirname, "../components/forum/forum-thread-page-client.tsx");
    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    const threadContent = readFileSync(threadPath, "utf8");
    expect(content).toContain("PATCH");
    expect(content).toContain("DELETE");
    expect(content).toContain("updateForumReply");
    expect(content).toContain("deleteForumReply");
    expect(content).toContain("await auth()");
    expect(threadContent).toContain("MathComposer");
    expect(threadContent).toContain("Edit answer");
    expect(threadContent).toContain('id="answer-composer"');
  });

  it("links question cards directly to the answer composer", () => {
    const forumClientPath = path.resolve(__dirname, "../components/forum/forum-page-client.tsx");
    const content = readFileSync(forumClientPath, "utf8");

    expect(content).toContain("View &amp; answer");
    expect(content).toContain("#answer-composer");
    expect(content).toContain("clearQuestionFilters");
    expect(content).toContain("onClick={openComposer}");
  });

  it("exposes the subscriber API endpoint", () => {
    const routePath = path.resolve(__dirname, "../app/api/subscribers/route.ts");

    expect(existsSync(routePath)).toBe(true);

    const content = readFileSync(routePath, "utf8");
    expect(content).toContain("export async function POST");
    expect(content).toContain("subscriber");
  });
});
