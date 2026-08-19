import Link from "next/link";
import { notFound } from "next/navigation";
import { publications, researchAreas, researchNotes } from "@/lib/academic-data";

export function generateStaticParams() {
  return researchAreas.map((area) => ({ slug: area.slug }));
}

export default function ResearchAreaPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
        <Link href="/research" className="transition hover:text-stone-950 dark:hover:text-white">
          ← Research
        </Link>
      </div>

      <AreaContent slug={(params as unknown as { slug: string }).slug} />
    </div>
  );
}

function AreaContent({ slug }: { slug: string }) {
  const area = researchAreas.find((entry) => entry.slug === slug);

  if (!area) {
    notFound();
  }

  const areaPublications = publications.filter((publication) =>
    publication.keywords.some((keyword) => keyword.toLowerCase().includes(area.title.toLowerCase().split(" ")[0]) || publication.title.toLowerCase().includes(area.title.toLowerCase().split(" ")[0]))
  );

  const areaNotes = researchNotes.filter((note) =>
    note.subject?.toLowerCase().includes(area.title.toLowerCase()) ||
    note.tags.some((tag) => tag.toLowerCase().includes(area.title.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <header className="max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Research area</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">{area.title}</h1>
        <p className="mt-4 text-lg leading-8 text-stone-600 dark:text-stone-300">{area.longDescription}</p>
      </header>

      <div className="rounded-[30px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 sm:p-8">
        <div className="flex flex-wrap gap-2">
          {area.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
              {keyword}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/70">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Related publications</h2>
            {areaPublications.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                {areaPublications.map((publication) => (
                  <li key={publication.id}>
                    <Link href={`/publications/${publication.slug}`} className="font-medium text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                      {publication.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Additional publications for this theme will be listed as the work expands.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/70">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Related notes</h2>
            {areaNotes.length > 0 ? (
              <ul className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                {areaNotes.map((note) => (
                  <li key={note.id}>
                    <Link href={`/notes/${note.slug}`} className="font-medium text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                      {note.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Notes for this research theme will be published here as they become available.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
