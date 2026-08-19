import Link from "next/link";
import { ArrowRight, FileText, FolderKanban, NotebookPen, Presentation, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Total publications", value: "2", icon: FileText },
  { label: "Research notes", value: "3", icon: NotebookPen },
  { label: "Projects", value: "2", icon: FolderKanban },
  { label: "Teaching entries", value: "2", icon: Presentation },
];

const quickActions = [
  {
    title: "Research notes",
    description: "Compose and publish mathematical notes with preview-ready formatting.",
    href: "/admin/notes",
    accent: "from-sky-500/10 to-blue-600/5",
  },
  {
    title: "New article",
    description: "Create a fresh note or editorial article with the advanced writing flow.",
    href: "/admin/notes/new",
    accent: "from-emerald-500/10 to-teal-600/5",
  },
  {
    title: "Public blog",
    description: "Preview how the front-end looks for readers outside the private workspace.",
    href: "/blog",
    accent: "from-violet-500/10 to-indigo-600/5",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-stone-800 dark:bg-stone-900">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.12),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_32%,#20314f_100%)] p-6 text-white sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">Admin</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Editorial control room</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Manage the public narrative, academic writing, and research communication from a single premium workspace built for a serious professional identity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/notes/new"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-stone-100"
                >
                  New article
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/blog"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Preview public site
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">Status</div>
                  <div className="mt-2 text-2xl font-semibold text-white">Live</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Protected
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Academic content ready",
                  "Blog and notes synchronized",
                  "Portfolio public profile aligned",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white">✓</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
            <div className="mt-2 text-sm text-stone-600 dark:text-stone-300">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`group rounded-[28px] border border-stone-200 bg-gradient-to-br ${action.accent} p-[1px] shadow-sm transition hover:-translate-y-0.5`}
          >
            <div className="h-full rounded-[27px] bg-white p-6 dark:bg-stone-900">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Quick action</div>
              <h2 className="mt-3 text-xl font-semibold text-stone-900 dark:text-stone-50">{action.title}</h2>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{action.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                Open
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
