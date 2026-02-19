export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookings } from "@/lib/admin-actions";
import { BookingsAdmin } from "@/components/admin/bookings-admin";

export default async function AdminBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allBookings = await getBookings();
  return <BookingsAdmin bookings={allBookings} />;
}
