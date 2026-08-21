-- Add a private-by-default public identity for every account.
ALTER TABLE "User" ADD COLUMN "nickname" TEXT;

-- Existing accounts receive an anonymous stable nickname. New accounts choose
-- their own nickname during registration.
UPDATE "User"
SET "nickname" = 'member-' || SUBSTRING(MD5("id") FROM 1 FOR 16)
WHERE "nickname" IS NULL;

ALTER TABLE "User" ALTER COLUMN "nickname" SET NOT NULL;

-- Nicknames are stored normalized to lowercase, making first-claim ownership
-- case-insensitive while retaining an ordinary Prisma unique field.
ALTER TABLE "User"
ADD CONSTRAINT "User_nickname_format_check"
CHECK (
  "nickname" = LOWER("nickname")
  AND "nickname" ~ '^[a-z0-9][a-z0-9_-]{2,23}$'
);

CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- Replace any previously copied real names in public forum records with the
-- account nickname while keeping email ownership data private in the database.
UPDATE "ForumTopic" AS topic
SET "authorName" = account."nickname"
FROM "User" AS account
WHERE topic."authorEmail" IS NOT NULL
  AND LOWER(topic."authorEmail") = LOWER(account."email");

UPDATE "ForumReply" AS reply
SET "authorName" = account."nickname"
FROM "User" AS account
WHERE reply."authorEmail" IS NOT NULL
  AND LOWER(reply."authorEmail") = LOWER(account."email");
