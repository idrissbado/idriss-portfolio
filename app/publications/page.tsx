import Link from "next/link";
import { publications } from "@/lib/academic-data";

export default function PublicationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Publications</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">Publication repository</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600 dark:text-stone-300">
          A concise bibliography of work spanning number theory, topology, statistical inference, and applied machine learning.
        </p>
      </header>

      <div className="rounded-[30px] border border-stone-200 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 sm:p-5">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 dark:border-stone-700 dark:bg-stone-800">Journal</span>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 dark:border-stone-700 dark:bg-stone-800">Preprint</span>
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1.5 dark:border-stone-700 dark:bg-stone-800">Research note</span>
        </div>

        <div className="space-y-5">
          {publications.map((publication) => (
            <article key={publication.id} className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-950/70 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {publication.publicationType} • {publication.status}
                  </div>
                  <Link href={`/publications/${publication.slug}`} className="mt-2 block text-2xl font-semibold tracking-[-0.04em] text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                    {publication.title}
                  </Link>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{publication.authors}</p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {publication.journal} • {publication.publicationYear}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">{publication.abstract}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col">
                  {publication.doi ? (
                    <a href={`https://doi.org/${publication.doi}`} className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:text-white">DOI</a>
                  ) : null}
                  {publication.pdfUrl ? (
                    <a href={publication.pdfUrl} className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:text-white">PDF</a>
                  ) : null}
                  {publication.externalUrl ? (
                    <a href={publication.externalUrl} className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:text-white">External page</a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
