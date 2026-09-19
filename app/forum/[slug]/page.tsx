import { notFound } from "next/navigation";
import { ForumThreadPageClient } from "@/components/forum/forum-thread-page-client";
import { getForumTopicBySlug, incrementForumTopicViews } from "@/lib/community-store";

export default async function ForumThreadPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params;
  const topic = await getForumTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const viewedTopic = (await incrementForumTopicViews(slug)) ?? topic;

  return <ForumThreadPageClient topic={viewedTopic} />;
}
