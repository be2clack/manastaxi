export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrderEvents } from "@/lib/admin-actions";
import { EventsAdmin } from "@/components/admin/events-admin";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allEvents = await getOrderEvents();
  return <EventsAdmin events={allEvents} />;
}
