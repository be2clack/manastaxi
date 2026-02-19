export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminTours } from "@/lib/admin-actions";
import { ToursAdmin } from "@/components/admin/tours-admin";

export default async function AdminToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allTours = await getAdminTours();

  return <ToursAdmin tours={allTours} />;
}
