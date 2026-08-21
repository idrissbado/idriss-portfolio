"use client";

import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

export function ForumAccountControl({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isDark = tone === "dark";

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut({ redirect: false });
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        aria-label="Loading member account"
        className={cn(
          "h-11 w-44 animate-pulse rounded-full",
          isDark ? "bg-white/10" : "bg-stone-200 dark:bg-stone-800",
        )}
      />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className={cn(
            "rounded-full border px-3.5 py-2 text-xs font-semibold transition",
            isDark
              ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
              : "border-stone-300 bg-white text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200",
          )}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={cn(
            "rounded-full px-3.5 py-2 text-xs font-semibold transition",
            isDark
              ? "bg-white text-slate-950 hover:bg-slate-100"
              : "bg-stone-900 text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900",
          )}
        >
          Join
        </Link>
      </div>
    );
  }

  const memberName = session.user.name || session.user.email || "Member";

  return (
    <div
      className={cn(
        "flex max-w-full items-center gap-2 rounded-full border p-1.5 pl-2 shadow-sm",
        isDark
          ? "border-white/15 bg-white/[0.08] text-white"
          : "border-stone-200 bg-white text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase",
          isDark ? "bg-white text-slate-950" : "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900",
        )}
      >
        {getInitials(memberName)}
      </div>

      <div className="hidden min-w-0 pr-1 text-left sm:block">
        <div className="max-w-32 truncate text-xs font-semibold">{memberName}</div>
        <div className={cn("flex items-center gap-1 text-[9px] uppercase tracking-[0.14em]", isDark ? "text-emerald-200" : "text-emerald-700 dark:text-emerald-300")}>
          <ShieldCheck className="h-3 w-3" />
          {session.user.role || "member"}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          isDark
            ? "bg-rose-400/15 text-rose-100 hover:bg-rose-400/25"
            : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300",
        )}
      >
        <LogOut className="h-3.5 w-3.5" />
        {isSigningOut ? "Leaving..." : "Log out"}
      </button>
    </div>
  );
}
