import { profile } from "@/lib/academic-data";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Let&apos;s build something serious.</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,31,60,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Email</div>
            <a href={`mailto:${profile.email}`} className="mt-2 block text-xl font-semibold text-slate-900 dark:text-slate-50">
              {profile.email}
            </a>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Phone</div>
            <p className="mt-2 text-base text-slate-700 dark:text-slate-200">+225 07 58 40 91 36</p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Location</div>
            <p className="mt-2 text-base text-slate-700 dark:text-slate-200">Abidjan, Côte d&apos;Ivoire · Remote-ready</p>
          </div>

          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <a href={profile.githubUrl} className="block hover:text-slate-900 dark:hover:text-slate-50">GitHub</a>
            <a href={profile.linkedinUrl} className="block hover:text-slate-900 dark:hover:text-slate-50">LinkedIn</a>
            <a href={profile.scholarUrl} className="block hover:text-slate-900 dark:hover:text-slate-50">Google Scholar</a>
            <a href={profile.orcid} className="block hover:text-slate-900 dark:hover:text-slate-50">ORCID</a>
          </div>
        </div>

        <form className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,31,60,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Name
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50" placeholder="Your name" />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Email
              <input type="email" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50" placeholder="name@example.com" />
            </label>
          </div>
          <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Message
            <textarea className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50" placeholder="Write a message..." />
          </label>
          <button type="submit" className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">Send message</button>
        </form>
      </div>
    </div>
  );
}
