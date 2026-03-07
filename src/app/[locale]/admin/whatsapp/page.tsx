export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/admin-actions";
import { WhatsAppAdmin } from "@/components/admin/whatsapp-admin";

export default async function AdminWhatsAppPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allSettings = await getSettings();
  return <WhatsAppAdmin settings={allSettings} />;
}
