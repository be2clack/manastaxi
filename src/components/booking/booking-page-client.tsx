"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { createBooking } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plane } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";

type BookingState = { success: boolean; error?: string } | null;

async function bookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  return createBooking(formData);
}

export function BookingPageClient({
  routes,
}: {
  routes: { id: number; toLocation: string; priceSom: number; priceUsd: number }[];
}) {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();
  const preselectedRoute = searchParams.get("route") || "";
  const [state, formAction, isPending] = useActionState(bookingAction, null);

  const whatsappNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "996XXXXXXXXX"
  ).replace(/[^0-9]/g, "");

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-taxi-blue/10">
                <Plane className="h-7 w-7 text-taxi-blue" />
              </div>
              <CardTitle className="text-2xl font-bold text-taxi-blue md:text-3xl">
                {t("title")}
              </CardTitle>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </CardHeader>
            <CardContent>
              {state?.success && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-green-700 border border-green-200">
                  {t("success")}
                </div>
              )}
              {state?.error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-center text-red-700 border border-red-200">
                  {t("error")}
                </div>
              )}

              <form action={formAction} className="space-y-5">
                <input type="hidden" name="source" value="website" />

                {/* Personal info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="b-name">{t("name")} *</Label>
                    <Input
                      id="b-name"
                      name="name"
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-phone">{t("phone")} *</Label>
                    <Input
                      id="b-phone"
                      name="phone"
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="b-email">{t("email")}</Label>
                  <Input
                    id="b-email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>

                {/* Trip info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="b-flight">{t("flightNumber")}</Label>
                    <Input
                      id="b-flight"
                      name="flightNumber"
                      placeholder={t("flightPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-route">{t("destination")} *</Label>
                    <select
                      id="b-route"
                      name="routeId"
                      defaultValue={preselectedRoute}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      <option value="">{t("destinationPlaceholder")}</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.toLocation} — {route.priceSom} KGS (${route.priceUsd})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="b-custom">{t("customDestination")}</Label>
                  <Input
                    id="b-custom"
                    name="customDestination"
                    placeholder={t("customDestPlaceholder")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="b-date">{t("date")} *</Label>
                    <Input id="b-date" name="pickupDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-time">{t("time")}</Label>
                    <Input id="b-time" name="pickupTime" type="time" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="b-pass">{t("passengers")}</Label>
                      <Input
                        id="b-pass"
                        name="passengers"
                        type="number"
                        min="1"
                        max="20"
                        defaultValue="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="b-lug">{t("luggage")}</Label>
                      <Input
                        id="b-lug"
                        name="luggage"
                        type="number"
                        min="0"
                        max="20"
                        defaultValue="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="b-notes">{t("notes")}</Label>
                  <Textarea
                    id="b-notes"
                    name="notes"
                    placeholder={t("notesPlaceholder")}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-taxi-blue hover:bg-taxi-blue-dark py-6 text-base font-semibold"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isPending ? "..." : t("submit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-green-500 text-green-600 hover:bg-green-50 py-6 text-base font-semibold"
                    onClick={() => {
                      const form = document.querySelector("form");
                      if (!form) return;
                      const fd = new FormData(form);
                      const text = `Booking request:\nName: ${fd.get("name")}\nPhone: ${fd.get("phone")}\nFlight: ${fd.get("flightNumber") || "-"}\nDate: ${fd.get("pickupDate")}\nTime: ${fd.get("pickupTime") || "-"}\nPassengers: ${fd.get("passengers")}`;
                      window.open(
                        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
                        "_blank"
                      );
                    }}
                  >
                    <FaWhatsapp className="mr-2 h-4 w-4" />
                    {t("submitWhatsapp")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
