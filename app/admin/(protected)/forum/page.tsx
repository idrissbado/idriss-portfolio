import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { createForumTopic, getForumTopics } from "@/lib/community-store";

async function createForumAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/admin");
  }

  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const authorName = formData.get("authorName")?.toString().trim() || session.user.name || "Administrator";
  const authorEmail = formData.get("authorEmail")?.toString().trim() || session.user.email || undefined;

  if (!title || !content) {
    redirect("/admin/forum?error=missing-fields");
  }

  await createForumTopic({ title, content, authorName, authorEmail, category: category || undefined });
  revalidatePath("/admin/forum");
  redirect("/admin/forum");
}

export default async function AdminForumPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    redirect("/admin");
  }

  const topics = await getForumTopics();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Community</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Forum moderation</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Moderate public discussions, review emerging themes, and keep the debate aligned with the research and publication identity of the site.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Start a discussion</h2>
          <form action={createForumAction} className="mt-5 space-y-4">
            <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
              <span>Title</span>
              <input
                name="title"
                type="text"
                required
                className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                placeholder="A question or topic to discuss"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Author</span>
                <input
                  name="authorName"
                  type="text"
                  defaultValue={session.user.name ?? "Administrator"}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Category</span>
                <select
                  name="category"
                  defaultValue="General"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                >
                  <option value="General">General</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Statistics">Statistics</option>
                  <option value="AI">AI</option>
                  <option value="Resources">Resources</option>
                </select>
              </label>
            </div>

            <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
              <span>Message</span>
              <textarea
                name="content"
                required
                className="min-h-32 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                placeholder="Describe the question or idea you want the community to discuss."
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900"
            >
              Publish topic
            </button>
          </form>
        </section>

        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Recent discussions</h2>
          <div className="mt-5 space-y-3">
            {topics.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-300">No public discussions yet.</p>
            ) : (
              topics.map((topic) => (
                <div key={topic.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">{topic.title}</p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{topic.authorName}</p>
                    </div>
                    <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-600 dark:border-stone-700 dark:text-stone-300">
                      {topic.category}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-stone-500 dark:text-stone-400">{topic.replies.length} replies</span>
                    <Link href={`/forum/${topic.slug}`} className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                      Open thread
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
