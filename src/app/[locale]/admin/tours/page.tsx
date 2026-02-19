export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminTours } from "@/lib/admin-actions";
import { updateTour, deleteTour } from "@/lib/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff } from "lucide-react";

export default async function AdminToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allTours = await getAdminTours();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tours ({allTours.length})</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">Tour</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Price USD</th>
                  <th className="px-4 py-3 font-medium">Price KGS</th>
                  <th className="px-4 py-3 font-medium">Max Group</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTours.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{t.slug}</td>
                    <td className="px-4 py-3">{t.durationDays} days</td>
                    <td className="px-4 py-3">${t.priceUsd}</td>
                    <td className="px-4 py-3">{t.priceSom} KGS</td>
                    <td className="px-4 py-3">{t.maxGroup}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          t.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <form
                          action={async () => {
                            "use server";
                            await updateTour(t.id, { isActive: !t.isActive });
                          }}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            type="submit"
                          >
                            {t.isActive ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-red-400" />
                            )}
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            "use server";
                            await deleteTour(t.id);
                          }}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500"
                            type="submit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
