import { notFound } from "next/navigation";
import { projects } from "@/lib/academic-data";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = projects.find((item) => item.slug === "research-knowledge-graph-platform");

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">{project.projectType}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">{project.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-600 dark:text-stone-300">{project.summary}</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8 text-stone-700 dark:text-stone-300">
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Problem</h2>
            <p className="mt-3 text-base leading-7">{project.problem}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Context</h2>
            <p className="mt-3 text-base leading-7">{project.description}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">My Role</h2>
            <p className="mt-3 text-base leading-7">{project.role}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Architecture</h2>
            <p className="mt-3 text-base leading-7">{project.architecture}</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Results</h2>
            <p className="mt-3 text-base leading-7">{project.results}</p>
          </section>
        </div>

        <aside className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Tech</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <span key={technology} className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">{technology}</span>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-sm text-stone-700 dark:text-stone-200">
            {project.githubUrl ? <a href={project.githubUrl} className="block rounded-xl border border-stone-300 px-3 py-2 dark:border-stone-700">Repository</a> : null}
            {project.liveUrl ? <a href={project.liveUrl} className="block rounded-xl border border-stone-300 px-3 py-2 dark:border-stone-700">Live project</a> : null}
            {project.documentationUrl ? <a href={project.documentationUrl} className="block rounded-xl border border-stone-300 px-3 py-2 dark:border-stone-700">Documentation</a> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
