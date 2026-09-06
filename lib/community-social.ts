import { prisma } from "@/lib/db";

export async function findCommunityUserByNickname(nickname: string) {
  return prisma.user.findUnique({
    where: { nickname: nickname.trim().toLowerCase() },
    select: { id: true, nickname: true, email: true, name: true },
  });
}

export async function listInbox(userId: string) {
  return prisma.directMessage.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { sender: { select: { nickname: true } } },
  });
}

export async function sendDirectMessage(input: {
  senderId: string;
  recipientNickname: string;
  subject: string;
  content: string;
}) {
  const recipient = await findCommunityUserByNickname(input.recipientNickname);
  if (!recipient || recipient.id === input.senderId) {
    return null;
  }

  return prisma.directMessage.create({
    data: {
      senderId: input.senderId,
      recipientId: recipient.id,
      subject: input.subject.trim(),
      content: input.content.trim(),
    },
    include: { sender: { select: { nickname: true } } },
  });
}

export async function markMessageRead(userId: string, messageId: string) {
  return prisma.directMessage.updateMany({
    where: { id: messageId, recipientId: userId },
    data: { readAt: new Date() },
  });
}

export async function createMentionNotifications(input: {
  authorId: string;
  authorName: string;
  topicSlug: string;
  content: string;
}) {
  const nicknames = Array.from(input.content.matchAll(/@([a-z0-9][a-z0-9_-]{2,23})/gi))
    .map((match) => match[1]?.toLowerCase())
    .filter(Boolean)
    .filter((nickname, index, values) => values.indexOf(nickname) === index);

  if (nicknames.length === 0) return 0;

  const users = await prisma.user.findMany({
    where: { nickname: { in: nicknames }, id: { not: input.authorId } },
    select: { id: true },
  });
  if (users.length === 0) return 0;

  const excerpt = input.content.replace(/\s+/g, " ").trim().slice(0, 180);
  await prisma.forumMention.createMany({
    data: users.map((user) => ({
      userId: user.id,
      topicSlug: input.topicSlug,
      authorName: input.authorName,
      excerpt,
    })),
  });
  return users.length;
}

export async function getUnreadSocialCount(userId: string) {
  const [messages, mentions] = await Promise.all([
    prisma.directMessage.count({ where: { recipientId: userId, readAt: null } }),
    prisma.forumMention.count({ where: { userId, readAt: null } }),
  ]);
  return { messages, mentions, total: messages + mentions };
}
