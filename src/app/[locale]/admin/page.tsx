export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBookingStats, getBookings } from "@/lib/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const [stats, recentBookings] = await Promise.all([
    getBookingStats(),
    getBookings(),
  ]);

  const recent = recentBookings.slice(0, 10);

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    confirmed: "bg-green-100 text-green-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-2xl font-bold">{stats.new}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No bookings yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">Flight</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((booking) => (
                    <tr key={booking.id} className="border-b">
                      <td className="px-3 py-2.5 font-medium">
                        {booking.name}
                      </td>
                      <td className="px-3 py-2.5">{booking.phone}</td>
                      <td className="px-3 py-2.5">
                        {booking.flightNumber || "—"}
                      </td>
                      <td className="px-3 py-2.5">{booking.pickupDate}</td>
                      <td className="px-3 py-2.5">
                        <Badge className={statusColors[booking.status]}>
                          {booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
