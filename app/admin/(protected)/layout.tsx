import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/notes", label: "Notes" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/notes/new", label: "New note" },
  { href: "/admin", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.10),transparent_20%),linear-gradient(180deg,#f8f5f1_0%,#f5f5f4_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.08),transparent_20%),linear-gradient(180deg,#0b1220_0%,#0b1120_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 overflow-hidden rounded-[28px] border border-stone-200 bg-white/80 shadow-[0_22px_60px_rgba(15,31,60,0.08)] backdrop-blur-xl dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex flex-col gap-4 border-b border-stone-200 px-6 py-5 dark:border-stone-800 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Private workspace</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Editorial control room</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Secure access
              </div>
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
              >
                Log out
              </Link>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}
