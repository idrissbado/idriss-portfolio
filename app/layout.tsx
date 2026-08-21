import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AcademicFooter } from "@/components/layout/academic-footer";
import { AcademicHeader } from "@/components/layout/academic-header";
import { AppSessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Idriss Olivier Bado | Researcher, Mathematician, Data & AI Engineer",
    template: "%s | Idriss Olivier Bado",
  },
  description:
    "Academic research website, publications repository, research notes, software and AI engineering portfolio for Idriss Olivier Bado.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://research.idrissbado.blog"),
  openGraph: {
    title: "Idriss Olivier Bado",
    description:
      "Researcher, mathematician, data engineer and AI software professional focused on topology, statistics, and machine learning.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <AppSessionProvider>
          <div className="flex min-h-screen flex-col">
            <AcademicHeader />
            <main className="flex-1">{children}</main>
            <AcademicFooter />
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}
