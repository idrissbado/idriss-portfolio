import Link from "next/link";
import { profile } from "@/lib/academic-data";

export function AcademicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white/85 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="text-lg font-semibold tracking-wide text-stone-900 dark:text-stone-100">
            {profile.fullName}
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">
            Research • Mathematics • Data • AI • Software Engineering
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Explore
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
            <li><Link href="/about" className="transition hover:text-stone-950 dark:hover:text-white">About</Link></li>
            <li><Link href="/research" className="transition hover:text-stone-950 dark:hover:text-white">Research</Link></li>
            <li><Link href="/publications" className="transition hover:text-stone-950 dark:hover:text-white">Publications</Link></li>
            <li><Link href="/projects" className="transition hover:text-stone-950 dark:hover:text-white">Projects</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Research
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
            <li><Link href="/notes" className="transition hover:text-stone-950 dark:hover:text-white">Research Notes</Link></li>
            <li><Link href="/teaching" className="transition hover:text-stone-950 dark:hover:text-white">Teaching</Link></li>
            <li><Link href="/cv" className="transition hover:text-stone-950 dark:hover:text-white">CV</Link></li>
            <li><Link href="/contact" className="transition hover:text-stone-950 dark:hover:text-white">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
            Profiles
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
            <li><a href={profile.githubUrl} className="transition hover:text-stone-950 dark:hover:text-white">GitHub</a></li>
            <li><a href={profile.linkedinUrl} className="transition hover:text-stone-950 dark:hover:text-white">LinkedIn</a></li>
            <li><a href={profile.scholarUrl} className="transition hover:text-stone-950 dark:hover:text-white">Google Scholar</a></li>
            <li><a href={profile.orcid} className="transition hover:text-stone-950 dark:hover:text-white">ORCID</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-500 dark:border-stone-800 dark:text-stone-400">
        © {new Date().getFullYear()} Idriss Olivier Bado. All rights reserved.
      </div>
    </footer>
  );
}
