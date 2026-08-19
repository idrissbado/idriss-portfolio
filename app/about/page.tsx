import Image from "next/image";
import Link from "next/link";
import { profile, researchAreas } from "@/lib/academic-data";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <aside className="rounded-[30px] border border-stone-200 bg-white/85 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 sm:p-6">
          <div className="mb-6 flex justify-center lg:justify-start">
            <div className="overflow-hidden rounded-full border border-stone-300 bg-stone-100 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-stone-700 dark:bg-stone-800">
              <Image src="/IDRISS.jpg" alt="Idriss Olivier Bado" width={160} height={160} className="h-28 w-28 object-cover object-center sm:h-32 sm:w-32" />
            </div>
          </div>
          <div className="space-y-4 text-sm text-stone-600 dark:text-stone-300">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Name
              </div>
              <div className="mt-1 text-stone-900 dark:text-stone-100">{profile.fullName}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Research
              </div>
              <div className="mt-1 text-stone-900 dark:text-stone-100">Mathematics • Data • AI</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Location
              </div>
              <div className="mt-1 text-stone-900 dark:text-stone-100">{profile.location}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Contact
              </div>
              <a href={`mailto:${profile.email}`} className="mt-1 inline-block text-stone-900 dark:text-stone-100">
                {profile.email}
              </a>
            </div>
          </div>
        </aside>

        <div className="space-y-8 sm:space-y-10">
          <section className="rounded-[28px] border border-stone-200 bg-white/85 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/70 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">About</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">Biography</h1>
            <p className="mt-5 text-base leading-8 text-stone-700 sm:text-lg dark:text-stone-300">{profile.shortBio}</p>
            <p className="mt-5 text-base leading-8 text-stone-600 dark:text-stone-300">{profile.bio}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Research interests</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {researchAreas.map((area) => (
                <div key={area.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{area.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{area.shortDescription}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Professional timeline</h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="text-sm font-medium text-stone-500 dark:text-stone-400">2025–present</div>
                <div className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Research and engineering portfolio</div>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">Development of mathematical research, technical writing, and applied AI/data engineering projects.</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="text-sm font-medium text-stone-500 dark:text-stone-400">Ongoing</div>
                <div className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">Scientific and technical collaboration</div>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">Work at the boundary of mathematics, software implementation, and analytical modeling for complex systems.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Links</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-stone-400 dark:border-stone-700">GitHub</a>
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-stone-400 dark:border-stone-700">LinkedIn</a>
              <a href={profile.scholarUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-stone-400 dark:border-stone-700">Google Scholar</a>
              <a href={profile.orcid} target="_blank" rel="noopener noreferrer" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-stone-400 dark:border-stone-700">ORCID</a>
              <Link href="/cv" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium transition hover:border-stone-400 dark:border-stone-700">CV</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
