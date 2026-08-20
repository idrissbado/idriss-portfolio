import { ForumPageClient } from "@/components/forum/forum-page-client";
import { getForumTopics } from "@/lib/community-store";

export default async function ForumPage() {
  const topics = await getForumTopics();

  return (
    <>
      <div className="sr-only">Discussion</div>
      <ForumPageClient initialTopics={topics} />
    </>
  );
}
