import { ForumPageClient } from "@/components/forum/forum-page-client";
import { getCommunityStats, getForumTopics } from "@/lib/community-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ForumPage() {
  const [topics, stats] = await Promise.all([getForumTopics(), getCommunityStats()]);

  return (
    <>
      <div className="sr-only">Discussion</div>
      <ForumPageClient initialTopics={topics} initialStats={stats} />
    </>
  );
}
