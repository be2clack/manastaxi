import { setRequestLocale } from "next-intl/server";
import { ContactsClient } from "@/components/contacts/contacts-client";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactsClient />;
}
