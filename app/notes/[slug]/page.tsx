import { notFound } from "next/navigation";
import { MathRenderer } from "@/components/math/math-renderer";
import { getResearchNotes } from "@/lib/content-store";

export default async function ResearchNoteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researchNotes = await getResearchNotes();
  const note = researchNotes.find((item) => item.slug === slug);

  if (!note) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.12),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#f3f4f6_100%)] p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{note.subject}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">{note.title}</h1>
          {note.subtitle ? <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600">{note.subtitle}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-stone-600">
            <span>{note.authors}</span>
            <span className="text-stone-400">•</span>
            <span>{new Date(note.date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-700">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-6 lg:p-8">
          <MathRenderer content={note.content} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Actions</h2>
            <div className="mt-4 space-y-2 text-sm text-stone-700">
              {note.pdfUrl ? (
                <a href={note.pdfUrl} className="block rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2 text-center transition hover:border-stone-400">
                  View PDF
                </a>
              ) : null}
              <button type="button" className="block w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-left transition hover:border-stone-400">
                Copy citation
              </button>
              <button type="button" className="block w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-left transition hover:border-stone-400">
                Copy link
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-stone-200 bg-stone-900 p-5 text-white shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">About the author</div>
            <div className="mt-3 text-lg font-semibold">{note.authors}</div>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Writing at the boundary of mathematics, data, and AI with a strong interest in rigorous, operational insight.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
