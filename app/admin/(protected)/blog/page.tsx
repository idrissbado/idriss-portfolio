import Link from "next/link";
import { researchNotes } from "@/lib/academic-data";

export default function AdminBlogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-50">Blog & writing</h1>
        </div>
        <Link href="/admin/notes/new" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900">
          + New article
        </Link>
      </div>

      <div className="space-y-4">
        {researchNotes.map((post) => (
          <article key={post.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{post.status}</div>
                <h2 className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">{post.title}</h2>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{post.subject ?? "Research writing"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/notes/${post.slug}`} className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium dark:border-stone-700">Preview</Link>
                <Link href={`/admin/notes/${post.id}/edit`} className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium dark:border-stone-700">Edit</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
