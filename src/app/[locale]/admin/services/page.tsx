export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminServices, updateService } from "@/lib/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allServices = await getAdminServices();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Services ({allServices.length})
      </h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Price USD</th>
                  <th className="px-4 py-3 font-medium">Price KGS</th>
                  <th className="px-4 py-3 font-medium">Icon</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allServices.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{s.slug}</td>
                    <td className="px-4 py-3">${s.priceUsd}</td>
                    <td className="px-4 py-3">{s.priceSom} KGS</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.iconName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          s.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={async () => {
                          "use server";
                          await updateService(s.id, {
                            isActive: !s.isActive,
                          });
                        }}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          type="submit"
                        >
                          {s.isActive ? (
                            <Eye className="h-4 w-4 text-green-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-red-400" />
                          )}
                        </Button>
                      </form>
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
