"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { createContactMessage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";

type State = { success: boolean; error?: string } | null;

async function contactAction(_prev: State, formData: FormData): Promise<State> {
  return createContactMessage(formData);
}

const messengers = [
  { name: "WhatsApp", href: "https://wa.me/996XXXXXXXXX", color: "hover:bg-green-600 bg-green-500" },
  { name: "Telegram", href: "https://t.me/manastaxi", color: "hover:bg-blue-600 bg-blue-500" },
  { name: "Viber", href: "viber://chat?number=+996XXXXXXXXX", color: "hover:bg-purple-700 bg-purple-600" },
  { name: "WeChat", href: "#", color: "hover:bg-green-700 bg-green-600" },
];

export function ContactsClient() {
  const t = useTranslations("contacts");
  const [state, formAction, isPending] = useActionState(contactAction, null);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-6">
            {/* Info cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-0 bg-taxi-blue/5">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t("address")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("addressValue")}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-taxi-blue/5">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t("phone")}</h3>
                    <a
                      href="tel:+996XXXXXXXXX"
                      className="text-sm text-taxi-blue hover:underline"
                    >
                      +996 XXX XXX XXX
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-taxi-blue/5">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-blue text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{t("email")}</h3>
                    <a
                      href="mailto:info@manastaxi.kg"
                      className="text-sm text-taxi-blue hover:underline"
                    >
                      info@manastaxi.kg
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-taxi-blue/5">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-taxi-yellow text-taxi-blue-dark">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {t("workingHours")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("workingHoursValue")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messengers */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">{t("messengers")}</h3>
              <div className="flex flex-wrap gap-3">
                {messengers.map((m) => (
                  <a
                    key={m.name}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors ${m.color}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {m.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-xl border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2920.4!2d74.4774!3d43.0553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389eb7c6f1b2e7e9%3A0x4e0c0d0e4d3b3a4b!2sManas%20International%20Airport!5e0!3m2!1sen!2skg!4v1700000000000!5m2!1sen!2skg"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Manas Airport Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  {t("writeUs")}
                </h3>

                {state?.success && (
                  <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                    {t("sendSuccess")}
                  </div>
                )}
                {state?.error && (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                    {t("sendError")}
                  </div>
                )}

                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">{t("nameLabel")} *</Label>
                    <Input
                      id="c-name"
                      name="name"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="c-email">{t("emailLabel")} *</Label>
                      <Input
                        id="c-email"
                        name="email"
                        type="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-phone">{t("phoneLabel")}</Label>
                      <Input id="c-phone" name="phone" type="tel" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-msg">{t("messageLabel")} *</Label>
                    <Textarea
                      id="c-msg"
                      name="message"
                      placeholder={t("messagePlaceholder")}
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-taxi-blue hover:bg-taxi-blue-dark py-6 text-base font-semibold"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isPending ? "..." : t("send")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
