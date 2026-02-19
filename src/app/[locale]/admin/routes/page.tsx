export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminRoutes } from "@/lib/admin-actions";
import { RoutesAdmin } from "@/components/admin/routes-admin";

export default async function AdminRoutesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allRoutes = await getAdminRoutes();
  return <RoutesAdmin routes={allRoutes} />;
}
