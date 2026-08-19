import Link from "next/link";
import { projects } from "@/lib/academic-data";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Projects</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">Case studies and technical work</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{project.projectType}</span>
              <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">{project.status}</span>
            </div>
            <Link href={`/projects/${project.slug}`} className="mt-4 block text-2xl font-semibold text-stone-900 dark:text-stone-50">
              {project.title}
            </Link>
            <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">{project.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.slice(0, 5).map((technology) => (
                <span key={technology} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">{technology}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
