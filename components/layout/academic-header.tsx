"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/research", label: "Research" },
  { href: "/publications", label: "Publications" },
  { href: "/notes", label: "Notes" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/teaching", label: "Teaching" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
];

export function AcademicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f9f6f1]/80 backdrop-blur-2xl dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className="relative h-11 w-11 flex-none overflow-hidden rounded-xl border border-stone-300 bg-stone-100 shadow-[0_12px_30px_rgba(15,23,42,0.12)] ring-1 ring-white/60 transition-transform duration-200 group-hover:scale-[1.02] dark:border-stone-700 dark:bg-stone-900">
            <img src="/IDRISS.jpg" alt="Idriss Olivier Bado" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-stone-900 dark:text-stone-100">
              Idriss Olivier Bado
            </div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-stone-500 dark:text-stone-400">
              Research • Data • AI
            </div>
          </div>
        </Link>

        <div className="hidden items-center rounded-full border border-stone-200 bg-white/70 p-1 shadow-[0_10px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl lg:flex dark:border-stone-800 dark:bg-stone-900/70">
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-all duration-200 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white",
                  item.href === "/" && "bg-stone-900 text-white shadow-sm dark:bg-stone-100 dark:text-stone-950"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Open search"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <Link
            href="/contact"
            className="hidden items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-[0_16px_35px_rgba(15,23,42,0.14)] transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200 sm:inline-flex"
          >
            Contact
            <ArrowRight className="h-4 w-4" />
          </Link>

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
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-stone-200 bg-[#f9f6f1]/95 backdrop-blur-xl lg:hidden dark:border-stone-800 dark:bg-stone-950/95">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-white",
                  item.href === "/" && "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-2">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-950"
              >
                Contact
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
