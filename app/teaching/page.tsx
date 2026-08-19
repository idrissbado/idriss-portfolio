import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, GraduationCap, NotebookPen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Teaching",
  description:
    "Teaching activities, courses and educational interests by Idriss Bado in mathematics, statistics, data science and machine learning.",
};

const verifiedTeaching = [
  {
    title: "Spatial Data Science & Machine Learning",
    institution: "Université Internationale des Sciences et Techniques (UIST)",
    level: "Lecturer",
    period: "Public profile references Mar 2022–Jun 2022",
    description:
      "Public profile information lists Idriss Olivier Bado as lecturer in Spatial Data Science and Machine Learning at UIST. This is the clearest public evidence of a teaching assignment currently available in public sources.",
    topics: [
      "Spatial data analysis",
      "Machine learning",
      "Applied analytical methods",
      "Data-driven modeling",
    ],
  },
];

const teachingAreas = [
  "Probability and statistical thinking",
  "Data science methods",
  "Machine learning",
  "Spatial data science",
  "Applied mathematical modeling",
  "Statistical computing and analysis",
];

const teachingMaterials = [
  "Lecture notes",
  "Problem sets",
  "Applied exercises",
  "Research-oriented notebooks",
  "Slides and seminar material",
];

export default function TeachingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-4xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
          Teaching
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">
          Teaching
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-600 dark:text-stone-300">
          My teaching lies at the intersection of mathematics, statistics, and computation, with emphasis on
          rigorous foundations and practical modeling. I am especially interested in teaching methods that connect
          theory with data-oriented problem solving and real-world analytical questions.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <GraduationCap className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Current / recent teaching</h2>
        </div>

        {verifiedTeaching.map((entry) => (
          <article
            key={entry.title}
            className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900 sm:p-7"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {entry.level}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-stone-900 dark:text-stone-50">{entry.title}</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Institution
                </p>
                <p className="mt-2 text-base text-stone-700 dark:text-stone-200">{entry.institution}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                  Academic period
                </p>
                <p className="mt-2 text-base text-stone-700 dark:text-stone-200">{entry.period}</p>
              </div>
            </div>

            <p className="mt-6 max-w-4xl text-base leading-7 text-stone-600 dark:text-stone-300">{entry.description}</p>

            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Topics
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <BookOpenText className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Selected teaching areas</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teachingAreas.map((area) => (
            <div
              key={area}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
            >
              {area}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <NotebookPen className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Teaching materials</h2>
        </div>

        <p className="mt-5 text-base leading-7 text-stone-600 dark:text-stone-300">
          Selected lecture notes, problem sets, and course materials will be added progressively. Public materials are
          not yet available for a full course archive, and no downloadable files are currently being presented here.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {teachingMaterials.map((material) => (
            <span
              key={material}
              className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
            >
              {material}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-stone-100 p-2 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Research and teaching</h2>
        </div>

        <p className="mt-5 max-w-4xl text-base leading-7 text-stone-600 dark:text-stone-300">
          My research and teaching are closely connected. The same mathematical instincts that shape my work in
          probability, statistics, data science, and computational modeling also guide how I approach instruction:
          rigorous understanding, clear structure, and analytic reasoning grounded in real data. This is reflected in
          the areas where my academic work and professional practice intersect.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-stone-700 dark:text-stone-200">
          <Link href="/research" className="rounded-full border border-stone-300 px-4 py-2 hover:border-stone-400 dark:border-stone-700">
            Research
          </Link>
          <Link href="/publications" className="rounded-full border border-stone-300 px-4 py-2 hover:border-stone-400 dark:border-stone-700">
            Publications
          </Link>
          <a
            href="https://www.linkedin.com/in/idriss-olivier-bado/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-stone-300 px-4 py-2 hover:border-stone-400 dark:border-stone-700"
          >
            LinkedIn profile
          </a>
        </div>
      </section>
    </div>
  );
}
