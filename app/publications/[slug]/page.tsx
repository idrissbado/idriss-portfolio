import Link from "next/link";
import { notFound } from "next/navigation";
import { publications } from "@/lib/academic-data";

export default function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = params.then((value) => value.slug);

  return null;
}
