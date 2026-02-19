"use client";

import { useTranslations, useLocale } from "next-intl";
import { useActionState } from "react";
import { createBooking } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle } from "lucide-react";

type BookingState = { success: boolean; error?: string } | null;

async function bookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  return createBooking(formData);
}

export function QuickBookingForm({
  routes,
}: {
  routes: { id: number; toLocation: string; priceSom: number }[];
}) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [state, formAction, isPending] = useActionState(bookingAction, null);

  const whatsappNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "996XXXXXXXXX"
  ).replace(/[^0-9]/g, "");

  return (
    <section className="py-16 bg-gray-50" id="quick-booking">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-taxi-blue md:text-3xl">
                {t("title")}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
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

              <form action={formAction} className="space-y-4">
                <input type="hidden" name="source" value="website" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("name")} *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("namePlaceholder")}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("phone")} *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="flightNumber">{t("flightNumber")}</Label>
                    <Input
                      id="flightNumber"
                      name="flightNumber"
                      placeholder={t("flightPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routeId">{t("destination")} *</Label>
                    <select
                      id="routeId"
                      name="routeId"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      <option value="">{t("destinationPlaceholder")}</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.toLocation} — {route.priceSom} KGS
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">{t("date")} *</Label>
                    <Input
                      id="pickupDate"
                      name="pickupDate"
                      type="date"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">{t("time")}</Label>
                    <Input id="pickupTime" name="pickupTime" type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passengers">{t("passengers")}</Label>
                    <Input
                      id="passengers"
                      name="passengers"
                      type="number"
                      min="1"
                      max="20"
                      defaultValue="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("notes")}</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder={t("notesPlaceholder")}
                    rows={2}
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
                      const text = `Заявка на такси:\nИмя: ${fd.get("name")}\nТелефон: ${fd.get("phone")}\nРейс: ${fd.get("flightNumber") || "-"}\nДата: ${fd.get("pickupDate")}\nВремя: ${fd.get("pickupTime") || "-"}`;
                      window.open(
                        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
                        "_blank"
                      );
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t("submitWhatsapp")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
