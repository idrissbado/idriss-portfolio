"use client";

import Link from "next/link";
import { AtSign, CheckCircle2, LogOut, ShieldCheck, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getNicknameValidationError,
  getPrivateFallbackNickname,
  isGeneratedNickname,
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  normalizeNickname,
} from "@/lib/nickname";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

function NicknameClaimDialog({
  currentNickname,
  onClaimed,
  onClose,
}: {
  currentNickname: string;
  onClaimed: (nickname: string) => Promise<void>;
  onClose: () => void;
}) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedNickname = normalizeNickname(nickname);
    const validationError = getNicknameValidationError(normalizedNickname);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/account/nickname", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: normalizedNickname }),
      });
      const payload = (await response.json()) as { error?: string; nickname?: string };

      if (!response.ok || !payload.nickname) {
        throw new Error(payload.error ?? "Unable to save this nickname.");
      }

      await onClaimed(payload.nickname);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unable to save this nickname.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onMouseDown={() => !isSubmitting && onClose()}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-dialog-title"
        className="w-full max-w-lg rounded-[28px] border border-white/20 bg-white p-6 text-stone-900 shadow-[0_30px_100px_rgba(15,23,42,0.4)] dark:bg-stone-900 dark:text-stone-100 sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              No new account needed
            </div>
            <h2 id="nickname-dialog-title" className="mt-4 text-2xl font-semibold tracking-tight">
              Choose your public nickname
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close nickname dialog"
            className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
          Replace <strong>@{currentNickname}</strong> once. Your login, email verification, questions, and answers stay connected to the same account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="claim-public-nickname" className="block text-sm font-medium">
            New nickname
          </label>
          <div className="relative">
            <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
            <input
              id="claim-public-nickname"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, ""));
                setError("");
              }}
              autoFocus
              autoCapitalize="none"
              autoComplete="nickname"
              spellCheck={false}
              minLength={NICKNAME_MIN_LENGTH}
              maxLength={NICKNAME_MAX_LENGTH}
              pattern="[a-z0-9][a-z0-9_-]{2,23}"
              aria-describedby="claim-nickname-guidance claim-nickname-error"
              className="w-full rounded-2xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:focus:ring-stone-800"
              placeholder="your-name"
              required
            />
          </div>
          <p id="claim-nickname-guidance" className="text-xs leading-5 text-stone-500 dark:text-stone-400">
            3–24 lowercase letters, numbers, hyphens, or underscores. The first member to claim it keeps it permanently.
          </p>
          <p id="claim-nickname-error" aria-live="polite" className="min-h-5 text-sm font-medium text-rose-700 dark:text-rose-300">
            {error}
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isSubmitting ? "Claiming nickname..." : "Claim this nickname"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ForumAccountControl({
  tone = "dark",
  onNicknameClaimed,
}: {
  tone?: "dark" | "light";
  onNicknameClaimed?: (previousNickname: string, nickname: string) => void;
}) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [claimedNickname, setClaimedNickname] = useState("");
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

  const memberName = claimedNickname || session.user.nickname || getPrivateFallbackNickname(session.user.id);
  const canClaimNickname = isGeneratedNickname(memberName);

  const handleNicknameClaimed = async (nickname: string) => {
    const previousNickname = memberName;
    setClaimedNickname(nickname);
    setIsClaimDialogOpen(false);
    onNicknameClaimed?.(previousNickname, nickname);
    await update().catch(() => null);
    router.refresh();
  };

  return (
    <>
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

        {canClaimNickname ? (
          <button
            type="button"
            onClick={() => setIsClaimDialogOpen(true)}
            aria-label="Choose your permanent public nickname"
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition",
              isDark
                ? "bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200",
            )}
          >
            <AtSign className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Choose nickname</span>
          </button>
        ) : null}

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

      {isClaimDialogOpen ? (
        <NicknameClaimDialog
          currentNickname={memberName}
          onClaimed={handleNicknameClaimed}
          onClose={() => setIsClaimDialogOpen(false)}
        />
      ) : null}
    </>
  );
}
