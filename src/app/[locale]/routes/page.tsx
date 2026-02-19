export const dynamic = "force-dynamic";

import { setRequestLocale } from "next-intl/server";
import { getRoutes } from "@/lib/actions";
import { RoutesClient } from "@/components/routes/routes-client";

export default async function RoutesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const routes = await getRoutes();

  return <RoutesClient routes={routes} />;
}
