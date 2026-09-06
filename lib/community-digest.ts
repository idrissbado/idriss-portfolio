import { Resend } from "resend";
import { prisma } from "@/lib/db";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://research.idrissbado.blog";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" }[character] ?? character));
}

export async function sendCommunityDigest(kind: "weekly" | "daily") {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: 0, skipped: true };

  const since = new Date(Date.now() - (kind === "weekly" ? 7 : 1) * 24 * 60 * 60 * 1000);
  const [users, topics] = await Promise.all([
    prisma.user.findMany({
      where: { emailVerified: { not: null }, ...(kind === "weekly" ? { weeklyDigestEnabled: true } : { dailyGuidanceEnabled: true }) },
      select: { email: true, nickname: true },
    }),
    prisma.forumTopic.findMany({ where: { published: true, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 8, select: { title: true, slug: true, category: true } }),
  ]);

  if (users.length === 0) return { sent: 0, skipped: false };

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM ?? "Idriss Olivier Bado <noreply@idrissbado.blog>";
  const subject = kind === "weekly" ? "Your weekly mathematics exercises / Vos exercices mathématiques de la semaine" : "Daily forum guide / Guide quotidien du forum";
  const topicList = topics.length > 0
    ? topics.map((topic) => `<li><a href="${getSiteUrl()}/forum/${encodeURIComponent(topic.slug)}">${escapeHtml(topic.title)}</a> <small>(${escapeHtml(topic.category)})</small></li>`).join("")
    : "<li>No new exercise yet. Create one and invite the community.</li>";
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#172033;max-width:680px;margin:auto"><h2>Mathematics community</h2><p><strong>English</strong><br>${kind === "weekly" ? "Here are this week's latest exercises and discussions." : "Today: choose a precise title, include your assumptions, add LaTeX with $...$ or $$...$$, choose tags, and mention a member with @nickname."}</p><p><strong>Français</strong><br>${kind === "weekly" ? "Voici les derniers exercices et discussions de la semaine." : "Aujourd'hui : choisissez un titre précis, ajoutez vos hypothèses, écrivez les formules en LaTeX avec $...$ ou $$...$$, choisissez des tags et mentionnez un membre avec @pseudo."}</p><ul>${topicList}</ul><p><a href="${getSiteUrl()}/forum" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Open forum / Ouvrir le forum</a></p></div>`;

  const result = await resend.batch.send(users.map((user) => ({ from: fromAddress, to: [user.email], subject, html, text: `Mathematics community / Communaute mathematique\n\n${kind === "weekly" ? "Latest exercises / Derniers exercices" : "Create a precise post with LaTeX, tags, and @mentions / Creez un post precis avec LaTeX, tags et @mentions"}\n\n${topics.map((topic) => `${topic.title}: ${getSiteUrl()}/forum/${topic.slug}`).join("\n")}` })));
  return { sent: users.length, id: result.data?.id ?? null, skipped: false };
}
