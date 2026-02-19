import { setRequestLocale } from "next-intl/server";
import { ServicesClient } from "@/components/services/services-client";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicesClient />;
}
