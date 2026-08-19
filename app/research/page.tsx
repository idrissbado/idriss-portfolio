import Link from "next/link";
import { researchAreas, publications, researchNotes } from "@/lib/academic-data";

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Research</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">Research program</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600 dark:text-stone-300">
          My work centers on structure: mathematical structure, statistical structure, computational structure, and the operational systems needed to make those ideas useful in real environments.
        </p>
      </header>

      <div className="space-y-8">
        {researchAreas.map((area) => (
          <article key={area.id} className="rounded-[30px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 sm:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Research area</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-stone-900 dark:text-stone-50">{area.title}</h2>
              </div>
              <Link href={`/research/${area.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                View area
              </Link>
            </div>

            <p className="mt-5 max-w-4xl text-base leading-7 text-stone-600 dark:text-stone-300">{area.longDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {area.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/70">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Selected works</h3>
                <ul className="mt-3 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                  {publications.slice(0, 2).map((publication) => (
                    <li key={publication.id}>
                      <Link href={`/publications/${publication.slug}`} className="font-medium text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                        {publication.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/70">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Research notes</h3>
                <ul className="mt-3 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                  {researchNotes.slice(0, 2).map((note) => (
                    <li key={note.id}>
                      <Link href={`/notes/${note.slug}`} className="font-medium text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                        {note.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
