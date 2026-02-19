export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminServices } from "@/lib/admin-actions";
import { ServicesAdmin } from "@/components/admin/services-admin";

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allServices = await getAdminServices();

  return <ServicesAdmin services={allServices} />;
}
