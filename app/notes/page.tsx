import Link from "next/link";
import { researchNotes } from "@/lib/academic-data";

export default function ResearchNotesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Research Notes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">Mathematical notes</h1>
      </header>

      <div className="space-y-5">
        {researchNotes.map((note) => (
          <article key={note.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{note.subject}</p>
                <Link href={`/notes/${note.slug}`} className="mt-2 block text-2xl font-semibold text-stone-900 hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                  {note.title}
                </Link>
                {note.subtitle ? <p className="mt-2 text-base text-stone-600 dark:text-stone-300">{note.subtitle}</p> : null}
              </div>
              <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                {note.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">{note.abstract}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
