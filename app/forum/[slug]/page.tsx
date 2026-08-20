import { notFound } from "next/navigation";
import { ForumThreadPageClient } from "@/components/forum/forum-thread-page-client";
import { getForumTopicBySlug } from "@/lib/community-store";

export default async function ForumThreadPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params;
  const topic = await getForumTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return <ForumThreadPageClient topic={topic} />;
}
