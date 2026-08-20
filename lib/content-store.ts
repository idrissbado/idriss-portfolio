import { prisma } from "@/lib/db";
import { researchNotes as fallbackResearchNotes, type ResearchNote, type ResearchNoteStatus } from "@/lib/academic-data";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "note";

const normalizeStatus = (value?: string): ResearchNoteStatus => {
  switch (value?.toUpperCase()) {
    case "DRAFT":
      return "Draft";
    case "PUBLIC":
      return "Public";
    case "PRIVATE":
      return "Private";
    case "ARCHIVED":
      return "Archived";
    default:
      return "Draft";
  }
};

const mapDbNote = (note: {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  abstract: string;
  authors: string;
  date: Date;
  lastUpdated?: Date | null;
  subject?: string | null;
  tags: { tag: { name: string } }[];
  status: string;
  content: string;
  references?: string | null;
  pdfUrl?: string | null;
  featured: boolean;
}) => {
  const tags = note.tags?.map((entry) => entry.tag?.name).filter(Boolean) ?? [];

  return {
    id: note.id,
    title: note.title,
    slug: note.slug,
    subtitle: note.subtitle ?? undefined,
    abstract: note.abstract,
    authors: note.authors,
    date: new Date(note.date).toISOString(),
    lastUpdated: note.lastUpdated ? new Date(note.lastUpdated).toISOString() : undefined,
    subject: note.subject ?? undefined,
    tags,
    status: normalizeStatus(note.status),
    content: note.content,
    references: note.references ?? undefined,
    pdfUrl: note.pdfUrl ?? undefined,
    featured: note.featured,
  } satisfies ResearchNote;
};

export async function getResearchNotes() {
  try {
    const notes = await prisma.researchNote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tags: { include: { tag: true } },
      },
    });

    if (!notes.length) {
      return fallbackResearchNotes;
    }

    return notes.map(mapDbNote);
  } catch {
    return fallbackResearchNotes;
  }
}

export async function createResearchNote(input: {
  title: string;
  subtitle?: string;
  abstract: string;
  authors: string;
  subject?: string;
  content: string;
  status?: "DRAFT" | "PUBLIC" | "PRIVATE" | "ARCHIVED";
  tags?: string[];
  featured?: boolean;
}) {
  const title = input.title.trim();
  const slug = slugify(title);
  const subject = input.subject?.trim() || "General";
  const authors = input.authors?.trim() || "Driss Olivier Bado";
  const content = input.content.trim();

  try {
    const created = await prisma.researchNote.create({
      data: {
        title,
        slug,
        subtitle: input.subtitle?.trim() || undefined,
        abstract: input.abstract.trim(),
        authors,
        subject,
        date: new Date(),
        status: input.status ?? "DRAFT",
        content,
        featured: Boolean(input.featured),
        visibility: "PUBLIC",
        tags: {
          create: (input.tags ?? [subject]).filter(Boolean).map((tagName) => {
            const cleanTag = tagName.trim();
            return {
              tag: {
                connectOrCreate: {
                  where: { name: cleanTag },
                  create: { name: cleanTag, slug: slugify(cleanTag) },
                },
              },
            };
          }),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return mapDbNote(created);
  } catch (error) {
    console.error("Failed to create research note:", error);
    return null;
  }
}
