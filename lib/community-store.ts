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
}): ForumTopic => ({
  id: topic.id,
  slug: topic.slug,
  title: topic.title,
  category: topic.category ?? "General",
  excerpt: topic.excerpt ?? null,
  content: topic.content,
  authorName: topic.authorName,
  authorEmail: topic.authorEmail ?? null,
  published: Boolean(topic.published),
  createdAt: new Date(topic.createdAt).toISOString(),
  updatedAt: new Date(topic.updatedAt).toISOString(),
  replies: (topic.replies ?? []).map(normalizeReply),
});

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
  excerpt?: string;
}) {
  const title = input.title.trim();
  const content = input.content.trim();
  const authorName = input.authorName.trim();

  if (!title || !content || !authorName) {
    return null;
  }

  const slug = slugify(title);
  const category = input.category?.trim() || "General";
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
