import { profile } from "@/lib/academic-data";

export default function CvPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Curriculum vitae</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">{profile.fullName}</h1>
        </div>
        <a href={profile.cvPdfUrl} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900">Download PDF CV</a>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Profile</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{profile.shortBio}</p>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Research interests</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <li>Number theory</li>
              <li>Topology and geometry</li>
              <li>Topological data analysis</li>
              <li>Machine learning</li>
              <li>Data engineering</li>
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Technical skills</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <li>Python</li>
              <li>TypeScript</li>
              <li>Next.js</li>
              <li>PostgreSQL</li>
              <li>Prisma</li>
            </ul>
          </section>
        </aside>

        <div className="space-y-8">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Professional experience</h2>
            <div className="mt-5 space-y-5 text-sm text-stone-600 dark:text-stone-300">
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-50">Research and software engineering</div>
                <div className="mt-1 text-stone-500 dark:text-stone-400">Independent research / technical portfolio</div>
              </div>
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-50">Applied AI and data systems</div>
                <div className="mt-1 text-stone-500 dark:text-stone-400">Interdisciplinary research and platform development</div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Education</h2>
            <div className="mt-5 space-y-5 text-sm text-stone-600 dark:text-stone-300">
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-50">Placeholder academic background</div>
                <div className="mt-1 text-stone-500 dark:text-stone-400">To be updated in the administration system.</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
