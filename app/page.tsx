import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookText, Cpu, Microscope, NotebookPen } from "lucide-react";
import { profile, projects, researchNotes } from "@/lib/academic-data";

const selectedWorks = [
  {
    title: "Information Graphs of Statistical Summaries",
    type: "Journal article",
    year: 2025,
    description: "Structural summaries that encode dependency and statistical pattern in interpretable graph form.",
    href: "/publications/information-graphs-statistical-summaries",
  },
  {
    title: "Topological Feature Engineering for Economic Regime Detection",
    type: "Preprint",
    year: 2026,
    description: "A study of structural change detection through topology, statistics and machine learning.",
    href: "/publications/topological-feature-engineering-economic-regime-detection-cote-divoire-1960-2022",
  },
  {
    title: "Goldbach Reduction Notes",
    type: "Research note",
    year: 2025,
    description: "A working note on additive reduction and arithmetic structure in analytic settings.",
    href: "/notes/goldbach-reduction",
  },
];

const researchDirections = [
  {
    title: "Arithmetic and Number Theory",
    description: "Questions of additive structure, analytic reduction, and arithmetic identities in mathematically grounded settings.",
    icon: BookText,
  },
  {
    title: "Topology and Geometric Methods",
    description: "Persistent structure, continuity, and invariants as tools for understanding complex systems.",
    icon: Microscope,
  },
  {
    title: "Topological & Statistical Data Analysis",
    description: "Feature extraction, regime detection, and model interpretation in data-rich scientific contexts.",
    icon: Cpu,
  },
  {
    title: "Machine Learning & Research Engineering",
    description: "Scientific ML workflows, reproducible pipelines, and reliable computational infrastructure.",
    icon: NotebookPen,
  },
];

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kicker">Mathematics · Statistics · AI</span>
            <h1 className="mt-6 max-w-2xl text-5xl tracking-[-0.06em] text-stone-950 sm:text-6xl dark:text-stone-50">
              {profile.fullName}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-700 sm:text-lg dark:text-stone-300">
              {profile.researchStatement}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
              >
                Research
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/publications"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-100"
              >
                Publications
              </Link>
              <a
                href={profile.cvPdfUrl}
                download="idriss-olivier-bado-cv.pdf"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-100"
              >
                CV
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-300">
              <a href={profile.scholarUrl} target="_blank" rel="noreferrer" className="transition hover:text-stone-950 dark:hover:text-white">Google Scholar</a>
              <a href={profile.orcid} target="_blank" rel="noreferrer" className="transition hover:text-stone-950 dark:hover:text-white">ORCID</a>
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="transition hover:text-stone-950 dark:hover:text-white">GitHub</a>
            </div>
          </div>

          <div className="rounded-[32px] border border-stone-200 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-stone-800 dark:bg-stone-900/70">
            <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950">
              <Image
                src="/IDRISS.jpg"
                alt="Idriss Olivier Bado"
                width={900}
                height={1100}
                className="h-[420px] w-full object-cover object-center sm:h-[520px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="kicker">Selected work</span>
            <h2 className="mt-3 text-3xl tracking-[-0.04em] text-stone-900 dark:text-stone-50">Recent research and writing</h2>
          </div>
          <Link href="/publications" className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
            View all
          </Link>
        </div>

        <div className="space-y-4">
          {selectedWorks.map((work) => (
            <article key={work.title} className="rounded-[24px] border border-stone-200 bg-white/70 p-5 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/70">
              <div className="grid gap-3 md:grid-cols-[110px_1fr_auto] md:items-baseline">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  {work.year}
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {work.type}
                  </div>
                  <Link href={work.href} className="mt-2 block text-2xl font-semibold leading-tight text-stone-950 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                    {work.title}
                  </Link>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 dark:text-stone-300">{work.description}</p>
                </div>
                <Link href={work.href} className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                  Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="kicker">Research directions</span>
          <h2 className="mt-3 text-3xl tracking-[-0.04em] text-stone-900 dark:text-stone-50">Core themes</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {researchDirections.map((direction) => {
            const Icon = direction.icon;

            return (
              <article key={direction.title} className="rounded-[24px] border border-stone-200 bg-white/70 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
                <div className="mb-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold leading-tight text-stone-900 dark:text-stone-50">{direction.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{direction.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="kicker">Latest writing</span>
            <h2 className="mt-3 text-3xl tracking-[-0.04em] text-stone-900 dark:text-stone-50">Research notes</h2>
          </div>
          <Link href="/notes" className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
            All notes
          </Link>
        </div>

        <div className="space-y-4">
          {researchNotes.slice(0, 3).map((note) => (
            <article key={note.id} className="rounded-[22px] border border-stone-200 bg-white/70 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{note.subject}</div>
                  <Link href={`/notes/${note.slug}`} className="mt-2 block text-xl font-semibold text-stone-950 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                    {note.title}
                  </Link>
                </div>
                <div className="text-sm text-stone-600 dark:text-stone-300">
                  {new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{note.abstract}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="kicker">Scientific projects</span>
            <h2 className="mt-3 text-3xl tracking-[-0.04em] text-stone-900 dark:text-stone-50">Selected technical work</h2>
          </div>
          <Link href="/projects" className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
            View all
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {projects.slice(0, 2).map((project) => (
            <article key={project.id} className="rounded-[24px] border border-stone-200 bg-white/70 p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{project.projectType}</span>
                <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {project.status}
                </span>
              </div>
              <Link href={`/projects/${project.slug}`} className="mt-4 block text-2xl font-semibold text-stone-950 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                {project.title}
              </Link>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{project.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900/70 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950">
            <Image
              src="/IDRISS.jpg"
              alt="Portrait of Idriss Olivier Bado"
              width={900}
              height={1100}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="kicker">Biography</span>
            <h2 className="mt-3 text-3xl tracking-[-0.04em] text-stone-900 dark:text-stone-50">Professional profile</h2>
            <p className="mt-5 text-base leading-8 text-stone-700 dark:text-stone-300">{profile.bio}</p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
              More about me
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
