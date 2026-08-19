import Link from "next/link";
import { publications } from "@/lib/academic-data";

export default function PublicationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Publications</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">Publication repository</h1>
      </header>

      <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full max-w-md rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
            Search publications
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">
            <span className="rounded-full border border-stone-200 px-2 py-1 dark:border-stone-700">Year</span>
            <span className="rounded-full border border-stone-200 px-2 py-1 dark:border-stone-700">Type</span>
            <span className="rounded-full border border-stone-200 px-2 py-1 dark:border-stone-700">Status</span>
          </div>
        </div>

        <div className="space-y-5">
          {publications.map((publication) => (
            <article key={publication.id} className="rounded-2xl border border-stone-200 p-6 dark:border-stone-800">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {publication.publicationType} • {publication.status}
                  </div>
                  <Link href={`/publications/${publication.slug}`} className="mt-2 block text-2xl font-semibold text-stone-900 hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
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
                    <a href={`https://doi.org/${publication.doi}`} className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium dark:border-stone-700">DOI</a>
                  ) : null}
                  {publication.pdfUrl ? (
                    <a href={publication.pdfUrl} className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium dark:border-stone-700">PDF</a>
                  ) : null}
                  {publication.externalUrl ? (
                    <a href={publication.externalUrl} className="rounded-full border border-stone-300 px-3 py-2 text-xs font-medium dark:border-stone-700">External page</a>
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
