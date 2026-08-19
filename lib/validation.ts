import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must contain at least 2 characters.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
  .transform((value) => value.toLowerCase());

export const publicationSchema = z.object({
  title: z.string().trim().min(3),
  slug: slugSchema.optional(),
  authors: z.string().trim().min(2),
  publicationYear: z.number().int().min(1900).max(2200),
  journal: z.string().trim().optional(),
  status: z.enum(["PUBLISHED", "ACCEPTED", "FORTHCOMING", "SUBMITTED", "PREPRINT", "WORK_IN_PROGRESS"]),
  publicationType: z.enum([
    "JOURNAL_ARTICLE",
    "PREPRINT",
    "CONFERENCE_PAPER",
    "BOOK_CHAPTER",
    "RESEARCH_NOTE",
    "THESIS",
  ]),
  abstract: z.string().min(10),
  keywords: z.array(z.string().trim()).default([]),
  doi: z.string().trim().optional(),
  externalUrl: z.string().trim().url().optional().or(z.literal("")),
  pdfUrl: z.string().trim().url().optional().or(z.literal("")),
  arxivUrl: z.string().trim().url().optional().or(z.literal("")),
  repositoryUrl: z.string().trim().url().optional().or(z.literal("")),
  bibtex: z.string().trim().optional(),
  citation: z.string().trim().optional(),
  featured: z.boolean().optional().default(false),
});

export const researchNoteSchema = z.object({
  title: z.string().trim().min(3),
  slug: slugSchema.optional(),
  subtitle: z.string().trim().optional(),
  abstract: z.string().trim().min(10),
  authors: z.string().trim().min(2),
  subject: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLIC", "PRIVATE", "ARCHIVED"]),
  content: z.string().min(20),
  references: z.string().trim().optional(),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string().trim()).default([]),
});

export const projectSchema = z.object({
  title: z.string().trim().min(3),
  slug: slugSchema.optional(),
  summary: z.string().trim().min(10),
  description: z.string().trim().min(20),
  projectType: z.enum([
    "SOFTWARE_ENGINEERING",
    "ARTIFICIAL_INTELLIGENCE",
    "MACHINE_LEARNING",
    "DATA_ENGINEERING",
    "DATA_SCIENCE",
    "RESEARCH_SOFTWARE",
    "GIS",
    "STATISTICAL_COMPUTING",
  ]),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED", "PLANNED"]),
  technologies: z.array(z.string().trim()).default([]),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  documentationUrl: z.string().trim().url().optional().or(z.literal("")),
  role: z.string().trim().optional(),
  organization: z.string().trim().optional(),
  problem: z.string().trim().optional(),
  approach: z.string().trim().optional(),
  architecture: z.string().trim().optional(),
  results: z.string().trim().optional(),
  technicalChallenges: z.string().trim().optional(),
});
