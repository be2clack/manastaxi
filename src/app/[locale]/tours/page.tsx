export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { ToursClient } from "@/components/tours/tours-client";
import { db } from "@/db";
import { tours } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function ToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allTours = await db
    .select()
    .from(tours)
    .where(eq(tours.isActive, true))
    .orderBy(asc(tours.sortOrder));

  return <ToursClient tours={allTours} />;
}
