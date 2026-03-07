export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVehicleClasses } from "@/lib/admin-actions";
import { VehicleClassesAdmin } from "@/components/admin/vehicle-classes-admin";

export default async function AdminVehicleClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const classes = await getVehicleClasses();
  return <VehicleClassesAdmin vehicleClasses={classes} />;
}
