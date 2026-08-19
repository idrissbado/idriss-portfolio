import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, BriefcaseBusiness, Cpu, LucideIcon, Microscope, NotebookPen, Sparkles } from "lucide-react";
import { profile, projects, publications, researchAreas, researchNotes } from "@/lib/academic-data";

const researchHighlights = [
  {
    title: "Information Graphs of Statistical Summaries",
    summary: "Structural summaries that encode statistical patterns and dependencies in interpretable graph representations.",
    href: "/publications/information-graphs-statistical-summaries",
  },
  {
    title: "Topological Feature Engineering",
    summary: "Machine-learning pipelines that use topological features to detect economic regime transitions.",
    href: "/publications/topological-feature-engineering-economic-regime-detection-cote-divoire-1960-2022",
  },
  {
    title: "Mathematical Notes in Number Theory",
    summary: "Research notes exploring reduction techniques and additive identities in analytic and arithmetic settings.",
    href: "/notes/goldbach-reduction",
  },
  {
    title: "Research Knowledge Graph Platform",
    summary: "A content infrastructure connecting publications, notes, and technical artifacts into a coherent research system.",
    href: "/projects/research-knowledge-graph-platform",
  },
];

const statCards = [
  { label: "Research areas", value: String(researchAreas.length) },
  { label: "Publications", value: String(publications.length) },
  { label: "Research notes", value: String(researchNotes.length) },
  { label: "Projects", value: String(projects.length) },
];

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">{title}</h2>
      </div>
      {action ? (
        <Link href={action.href} className="text-sm font-medium text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-stone-50">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="mb-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-stone-50 dark:bg-stone-950">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-700 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-200">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Researcher • Mathematician • Data / AI Engineer
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-stone-950 dark:text-stone-50 sm:text-5xl lg:text-6xl">
              {profile.fullName}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg dark:text-stone-300">
              {profile.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/research"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
              >
                View Research
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/publications"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"
              >
                Publications
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"
              >
                Projects
              </Link>
              <a
                href={profile.cvPdfUrl}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-medium text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-100"
              >
                Download CV
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-stone-200 bg-white/80 p-4 shadow-[0_28px_80px_rgba(15,31,60,0.08)] backdrop-blur-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(120,119,198,0.18),transparent_40%)]" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                  Current focus
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-stone-100 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-stone-800 dark:bg-stone-950">
                <Image
                  src="/IDRISS.jpg"
                  alt="Idriss Olivier Bado"
                  width={900}
                  height={1100}
                  className="h-72 w-full object-cover object-center sm:h-80 lg:h-[32rem]"
                  priority
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {statCards.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-stone-200 bg-stone-50/90 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-950/80">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{stat.label}</div>
                    <div className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-stone-200 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,31,60,0.06)] backdrop-blur-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900/70">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
            Research statement
          </p>
          <p className="mt-5 max-w-4xl text-base leading-8 text-stone-700 sm:text-lg dark:text-stone-200">
            {profile.researchStatement}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Selected research" title="Research themes and active directions" action={{ href: "/research", label: "Browse all research" }} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {researchHighlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700">
              <div className="mb-4 inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                <Microscope className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-semibold leading-6 text-stone-900 dark:text-stone-50">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{item.summary}</p>
              <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                Read more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Publications" title="Selected publications" action={{ href: "/publications", label: "All publications" }} />
        <div className="space-y-4">
          {publications.map((publication) => (
            <article key={publication.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                    {publication.publicationType} • {publication.status}
                  </div>
                  <Link href={`/publications/${publication.slug}`} className="mt-2 block text-xl font-semibold text-stone-900 hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                    {publication.title}
                  </Link>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{publication.authors}</p>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    {publication.journal} • {publication.publicationYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {publication.doi ? (
                    <a href={`https://doi.org/${publication.doi}`} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium dark:border-stone-700">
                      DOI
                    </a>
                  ) : null}
                  {publication.pdfUrl ? (
                    <a href={publication.pdfUrl} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium dark:border-stone-700">
                      PDF
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Projects" title="Featured engineering work" action={{ href: "/projects", label: "All projects" }} />
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">{project.projectType}</span>
                <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] dark:border-stone-700 dark:bg-stone-800">
                  {project.status}
                </span>
              </div>
              <Link href={`/projects/${project.slug}`} className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
                {project.title}
              </Link>
              <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">{project.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.technologies.slice(0, 5).map((technology) => (
                  <span key={technology} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {technology}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Research areas" title="Current themes" action={{ href: "/research", label: "Research overview" }} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {researchAreas.map((area) => (
            <div key={area.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{area.shortDescription}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Current work" title="Ongoing research and practice" />
        <div className="grid gap-5 md:grid-cols-3">
          <Card icon={NotebookPen} title="Mathematical notes" description="Long-form mathematical writing combining technical argumentation with formal notation and structured references." />
          <Card icon={Cpu} title="Computational methods" description="Interpretable pipelines for statistical summaries, regime detection, and topology-driven feature engineering." />
          <Card icon={BriefcaseBusiness} title="Research engineering" description="Production-oriented systems that connect mathematical ideas to reliable, auditable software artifacts." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Professional snapshot" title="Academic and technical timeline" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Research engagement</h3>
            <ul className="mt-4 space-y-4 text-sm text-stone-600 dark:text-stone-300">
              <li><span className="font-medium text-stone-900 dark:text-stone-50">2025</span> — Publication in Afrika Statistika on information graphs of statistical summaries.</li>
              <li><span className="font-medium text-stone-900 dark:text-stone-50">2026</span> — Preprint on topological feature engineering for economic regime detection.</li>
              <li><span className="font-medium text-stone-900 dark:text-stone-50">Ongoing</span> — Research notes and mathematical writing focused on arithmetic and topology.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Engineering practice</h3>
            <ul className="mt-4 space-y-4 text-sm text-stone-600 dark:text-stone-300">
              <li><span className="font-medium text-stone-900 dark:text-stone-50">Systems</span> — Data and research platform design with PostgreSQL, Next.js, and Prisma.</li>
              <li><span className="font-medium text-stone-900 dark:text-stone-50">AI</span> — Machine learning and applied AI workflows using rigorous data-driven methods.</li>
              <li><span className="font-medium text-stone-900 dark:text-stone-50">Research software</span> — Scientific content systems and computational tools for data analysis.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-stone-200 bg-stone-900 p-8 text-stone-50 dark:border-stone-700">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">Professional profile</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Research, engineering, and data systems.</h2>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-200">
              Contact
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
