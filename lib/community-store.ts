import { prisma } from "@/lib/db";

export type SubscriberRecord = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  interest: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ForumReplyRecord = {
  id: string;
  topicId: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type ForumTopic = {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string | null;
  content: string;
  authorName: string;
  authorEmail: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ForumReplyRecord[];
};

export type CommunityMember = {
  name: string;
  role: string;
  rep: number;
  badge: string;
};

export type CommunityStats = {
  memberCount: number;
  questionCount: number;
  answerCount: number;
  featuredMembers: CommunityMember[];
};

const fallbackSubscribers: SubscriberRecord[] = [];

const fallbackTopics: ForumTopic[] = [];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "discussion";

const normalizeSubscriber = (subscriber: {
  id: string;
  email: string;
  name?: string | null;
  source?: string | null;
  interest?: string | null;
  status?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SubscriberRecord => ({
  id: subscriber.id,
  email: subscriber.email,
  name: subscriber.name ?? null,
  source: subscriber.source ?? null,
  interest: subscriber.interest ?? null,
  status: subscriber.status ?? "active",
  createdAt: new Date(subscriber.createdAt).toISOString(),
  updatedAt: new Date(subscriber.updatedAt).toISOString(),
});

const normalizeReply = (reply: {
  id: string;
  topicId: string;
  authorName: string;
  authorEmail?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}): ForumReplyRecord => ({
  id: reply.id,
  topicId: reply.topicId,
  authorName: reply.authorName,
  authorEmail: reply.authorEmail ?? null,
  content: reply.content,
  createdAt: new Date(reply.createdAt).toISOString(),
  updatedAt: new Date(reply.updatedAt).toISOString(),
});

const normalizeTopic = (topic: {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  tags?: string[] | null;
  excerpt?: string | null;
  content: string;
  authorName: string;
  authorEmail?: string | null;
  published?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  replies?: Array<{
    id: string;
    topicId: string;
    authorName: string;
    authorEmail?: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}): ForumTopic => {
  const category = topic.category ?? "General";
  const tags = Array.isArray(topic.tags) && topic.tags.length > 0
    ? topic.tags
    : category
      .split(/[^a-zA-Z0-9]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    category,
    tags,
    excerpt: topic.excerpt ?? null,
    content: topic.content,
    authorName: topic.authorName,
    authorEmail: topic.authorEmail ?? null,
    published: Boolean(topic.published),
    createdAt: new Date(topic.createdAt).toISOString(),
    updatedAt: new Date(topic.updatedAt).toISOString(),
    replies: (topic.replies ?? []).map(normalizeReply),
  };
};

export async function getSubscribers() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return subscribers.map(normalizeSubscriber);
  } catch (error) {
    console.error("Subscriber DB query failed:", error);
    return fallbackSubscribers;
  }
}

export async function createSubscriber(input: {
  email: string;
  name?: string;
  source?: string;
  interest?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || null;
  const source = input.source?.trim() || null;
  const interest = input.interest?.trim() || null;

  if (!email) {
    return null;
  }

  try {
    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {
        name,
        source,
        interest,
        status: "active",
      },
      create: {
        email,
        name,
        source,
        interest,
        status: "active",
      },
    });

    return normalizeSubscriber(subscriber);
  } catch (error) {
    console.error("Subscriber upsert failed:", error);
    const existing = fallbackSubscribers.find((item) => item.email === email);
    if (existing) {
      return { ...existing, name, source, interest, status: "active", updatedAt: new Date().toISOString() };
    }

    const created = {
      id: `fallback-subscriber-${Date.now()}`,
      email,
      name,
      source,
      interest,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies SubscriberRecord;

    fallbackSubscribers.push(created);
    return created;
  }
}

export async function getForumTopics() {
  try {
    const topics = await prisma.forumTopic.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return topics.map(normalizeTopic);
  } catch (error) {
    console.error("Forum topics query failed:", error);
    return fallbackTopics;
  }
}

export async function getCommunityStats(): Promise<CommunityStats> {
  try {
    const [memberCount, questionCount, answerCount, recentMembers] = await Promise.all([
      prisma.user.count(),
      prisma.forumTopic.count({ where: { published: true } }),
      prisma.forumReply.count(),
      prisma.user.findMany({
        where: { name: { not: null } },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          name: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const featuredMembers: CommunityMember[] = recentMembers.map((user, index) => ({
      name: user.name ?? `Member ${index + 1}`,
      role: user.role || "Community member",
      rep: 30 + (index + 1) * 20,
      badge: index === 0 ? "Active" : index === 1 ? "Contributor" : "Researcher",
    }));

    return {
      memberCount,
      questionCount,
      answerCount,
      featuredMembers,
    };
  } catch (error) {
    console.error("Community stats query failed:", error);
    return {
      memberCount: 0,
      questionCount: 0,
      answerCount: 0,
      featuredMembers: [],
    };
  }
}

export async function getForumTopicBySlug(slug: string) {
  try {
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!topic) {
      return null;
    }

    return normalizeTopic(topic);
  } catch (error) {
    console.error("Forum topic lookup failed:", error);
    return fallbackTopics.find((item) => item.slug === slug) ?? null;
  }
}

export async function createForumTopic(input: {
  title: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
}) {
  const title = input.title.trim();
  const content = input.content.trim();
  const authorName = input.authorName.trim();

  if (!title || !content || !authorName) {
    return null;
  }

  const normalizedTags = Array.from(
    new Set((input.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 5)),
  );

  const slug = slugify(title);
  const category = input.category?.trim() || normalizedTags[0] || "General";
  const excerpt = input.excerpt?.trim() || content.slice(0, 180);

  try {
    const created = await prisma.forumTopic.create({
      data: {
        slug,
        title,
        category,
        excerpt,
        content,
        authorName,
        authorEmail: input.authorEmail?.trim() || null,
        published: true,
      },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });

    return normalizeTopic(created);
  } catch (error) {
    console.error("Forum topic creation failed:", error);
    const created = {
      id: `fallback-topic-${Date.now()}`,
      slug,
      title,
      category,
      tags: normalizedTags,
      excerpt,
      content,
      authorName,
      authorEmail: input.authorEmail?.trim() || null,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    } satisfies ForumTopic;

    fallbackTopics.unshift(created);
    return created;
  }
}

export async function updateForumTopic(input: {
  slug: string;
  title?: string;
  content?: string;
  category?: string;
  authorName?: string;
  authorEmail?: string;
  editorEmail?: string;
  excerpt?: string;
}) {
  const slug = input.slug.trim();
  const nextTitle = input.title?.trim() || undefined;
  const nextContent = input.content?.trim() || undefined;
  const nextCategory = input.category?.trim() || undefined;
  const nextExcerpt = input.excerpt?.trim() || undefined;
  const editorEmail = input.editorEmail?.trim().toLowerCase() || undefined;
  const authorName = input.authorName?.trim() || undefined;

  if (!slug || (!nextTitle && !nextContent && !nextCategory && !nextExcerpt && !authorName && !authorEmail)) {
    return null;
  }

  try {
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });

    if (!topic) {
      return null;
    }

    const isAllowedByEmail = !!editorEmail && !!topic.authorEmail && editorEmail === topic.authorEmail.trim().toLowerCase();
    const isAllowedByName = !!authorName && topic.authorName.trim().toLowerCase() === authorName.trim().toLowerCase();

    if (!isAllowedByEmail && !isAllowedByName) {
      return null;
    }

    const updated = await prisma.forumTopic.update({
      where: { id: topic.id },
      data: {
        title: nextTitle ?? topic.title,
        content: nextContent ?? topic.content,
        category: nextCategory ?? topic.category,
        excerpt: nextExcerpt ?? topic.excerpt ?? null,
        authorName: authorName ?? topic.authorName,
        authorEmail: input.authorEmail?.trim() || topic.authorEmail || null,
      },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });

    return normalizeTopic(updated);
  } catch (error) {
    console.error("Forum topic update failed:", error);
    const topic = fallbackTopics.find((item) => item.slug === slug);
    if (!topic) {
      return null;
    }

    const isAllowedByEmail = !!editorEmail && !!topic.authorEmail && editorEmail === topic.authorEmail.trim().toLowerCase();
    const isAllowedByName = !!authorName && topic.authorName.trim().toLowerCase() === authorName.trim().toLowerCase();

    if (!isAllowedByEmail && !isAllowedByName) {
      return null;
    }

    const updatedTopic = {
      ...topic,
      title: nextTitle ?? topic.title,
      content: nextContent ?? topic.content,
      category: nextCategory ?? topic.category,
      excerpt: nextExcerpt ?? topic.excerpt ?? null,
      authorName: authorName ?? topic.authorName,
      authorEmail: input.authorEmail?.trim() || topic.authorEmail || null,
      updatedAt: new Date().toISOString(),
    } satisfies ForumTopic;

    const index = fallbackTopics.findIndex((item) => item.slug === slug);
    if (index >= 0) {
      fallbackTopics[index] = updatedTopic;
    }

    return updatedTopic;
  }
}

export async function deleteForumTopic(input: {
  slug: string;
  authorEmail?: string;
  editorEmail?: string;
  authorName?: string;
}) {
  const slug = input.slug.trim();
  const authorEmail = input.authorEmail?.trim().toLowerCase();
  const editorEmail = input.editorEmail?.trim().toLowerCase();
  const authorName = input.authorName?.trim();

  if (!slug) {
    return false;
  }

  try {
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    });

    if (!topic) {
      return false;
    }

    const isAllowedByEmail = !!editorEmail && !!topic.authorEmail && editorEmail === topic.authorEmail.trim().toLowerCase();
    const isAllowedByName = !!authorName && topic.authorName.trim().toLowerCase() === authorName.trim().toLowerCase();

    if (!isAllowedByEmail && !isAllowedByName && !(authorEmail && topic.authorEmail && authorEmail === topic.authorEmail.trim().toLowerCase())) {
      return false;
    }

    await prisma.forumReply.deleteMany({ where: { topicId: topic.id } });
    await prisma.forumTopic.delete({ where: { id: topic.id } });
    return true;
  } catch (error) {
    console.error("Forum topic deletion failed:", error);
    const index = fallbackTopics.findIndex((item) => item.slug === slug);
    if (index < 0) {
      return false;
    }

    const target = fallbackTopics[index];
    const isAllowedByEmail = !!editorEmail && !!target.authorEmail && editorEmail === target.authorEmail.trim().toLowerCase();
    const isAllowedByName = !!authorName && target.authorName.trim().toLowerCase() === authorName.trim().toLowerCase();
    const isAllowedByAuthorEmail = !!authorEmail && !!target.authorEmail && authorEmail === target.authorEmail.trim().toLowerCase();

    if (!isAllowedByEmail && !isAllowedByName && !isAllowedByAuthorEmail) {
      return false;
    }

    fallbackTopics.splice(index, 1);
    return true;
  }
}

export async function createForumReply(input: {
  slug: string;
  authorName: string;
  content: string;
  authorEmail?: string;
}) {
  const slug = input.slug.trim();
  const authorName = input.authorName.trim();
  const content = input.content.trim();

  if (!slug || !authorName || !content) {
    return null;
  }

  try {
    const topic = await prisma.forumTopic.findUnique({
      where: { slug },
    });

    if (!topic) {
      return null;
    }

    const reply = await prisma.forumReply.create({
      data: {
        topicId: topic.id,
        authorName,
        authorEmail: input.authorEmail?.trim() || null,
        content,
      },
    });

    return normalizeReply(reply);
  } catch (error) {
    console.error("Forum reply creation failed:", error);
    const topic = fallbackTopics.find((item) => item.slug === slug);
    if (!topic) {
      return null;
    }

    const created = {
      id: `fallback-reply-${Date.now()}`,
      topicId: topic.id,
      authorName,
      authorEmail: input.authorEmail?.trim() || null,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies ForumReplyRecord;

    topic.replies = [...topic.replies, created];
    topic.updatedAt = new Date().toISOString();
    return created;
  }
}
