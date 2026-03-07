export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAiSettings } from "@/lib/admin-actions";
import { AiSettingsAdmin } from "@/components/admin/ai-settings-admin";

export default async function AdminAiSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allAiSettings = await getAiSettings();
  return <AiSettingsAdmin settings={allAiSettings} />;
}
