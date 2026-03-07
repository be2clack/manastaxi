export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTelegramSettings } from "@/lib/admin-actions";
import { TelegramAdmin } from "@/components/admin/telegram-admin";

export default async function AdminTelegramPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const telegramSettings = await getTelegramSettings();
  return <TelegramAdmin settings={telegramSettings} />;
}
