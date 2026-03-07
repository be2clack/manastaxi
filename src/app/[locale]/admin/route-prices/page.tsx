export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getAdminRoutes,
  getVehicleClasses,
  getRoutePrices,
} from "@/lib/admin-actions";
import { RoutePricesAdmin } from "@/components/admin/route-prices-admin";

export default async function AdminRoutePricesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const [routes, vehicleClasses, routePrices] = await Promise.all([
    getAdminRoutes(),
    getVehicleClasses(),
    getRoutePrices(),
  ]);

  return (
    <RoutePricesAdmin
      routes={routes}
      vehicleClasses={vehicleClasses}
      routePrices={routePrices}
    />
  );
}
