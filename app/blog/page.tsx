import Link from "next/link";
import { profile, researchNotes } from "@/lib/academic-data";

const featuredPost = researchNotes[0];
const otherPosts = researchNotes.slice(1);

export default function BlogPage() {
  return (
    <div className="bg-stone-50">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.16),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_32%,#1d2b42_100%)] px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">Journal</p>
                <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Essays, ideas, and mathematical writing.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
                  Short essays and technical notes at the intersection of mathematics, data, AI, and software engineering.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Mathematics', 'AI', 'Research', 'System design'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">Author</div>
                <div className="mt-3 text-2xl font-semibold text-white">{profile.fullName}</div>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Researcher, mathematician, and engineer writing on rigorous ideas with practical depth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Featured note</div>
            <Link href={`/notes/${featuredPost.slug}`} className="mt-3 block text-3xl font-semibold tracking-tight text-stone-900 hover:text-stone-700">
              {featuredPost.title}
            </Link>
            <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">{featuredPost.abstract}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {featuredPost.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-stone-200 pt-5">
              <div className="text-sm text-stone-600">{featuredPost.authors}</div>
              <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600">
                {new Date(featuredPost.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </article>

          <aside className="space-y-5">
            <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Writing focus</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                <li>• Number theory and analytic structure</li>
                <li>• AI systems and practical modeling</li>
                <li>• Research engineering and data design</li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-stone-900 p-6 text-white shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">Now reading</div>
              <div className="mt-3 text-lg font-semibold">Research notes with a technical point of view.</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Latest writing</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">Recent articles</h2>
          </div>
        </div>

        <div className="space-y-6">
          {otherPosts.map((post) => (
            <article key={post.id} className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-stone-300 sm:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{post.status}</div>
                  <Link href={`/notes/${post.slug}`} className="mt-2 block text-2xl font-semibold text-stone-900 hover:text-stone-700">
                    {post.title}
                  </Link>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">{post.abstract}</p>
                </div>

                <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600">
                  {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
