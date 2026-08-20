"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/research", label: "Research" },
  { href: "/publications", label: "Publications" },
  { href: "/blog", label: "Writing" },
  { href: "/forum", label: "Forum" },
  { href: "/teaching", label: "Teaching" },
  { href: "/projects", label: "Projects" },
  { href: "/cv", label: "CV" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function AcademicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f7f2ec]/85 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-300 bg-stone-100 shadow-sm ring-1 ring-white/60 transition-transform duration-200 group-hover:scale-[1.02] dark:border-stone-700 dark:bg-stone-900">
            <Image src="/IDRISS.jpg" alt="Idriss Olivier Bado" width={80} height={80} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-stone-900 dark:text-stone-100">
              Idriss Bado
            </div>
          </div>
        </Link>

        <div className="hidden items-center lg:flex">
          <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-full border border-stone-200 bg-white/60 px-2 py-1.5 shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium tracking-[-0.01em] text-stone-600 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white",
                  item.href === "/research" && "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800 lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-stone-200 bg-[#f7f2ec]/95 backdrop-blur-xl lg:hidden dark:border-stone-800 dark:bg-stone-950/95">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white",
                  item.href === "/research" && "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
