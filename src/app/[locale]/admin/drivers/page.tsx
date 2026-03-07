export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDrivers, getVehicleClasses } from "@/lib/admin-actions";
import { DriversAdmin } from "@/components/admin/drivers-admin";

export default async function AdminDriversPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const [allDrivers, vehicleClasses] = await Promise.all([
    getDrivers(),
    getVehicleClasses(),
  ]);

  return <DriversAdmin drivers={allDrivers} vehicleClasses={vehicleClasses} />;
}
