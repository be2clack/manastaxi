export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConversations, getConversationMessages } from "@/lib/admin-actions";
import { ConversationsAdmin } from "@/components/admin/conversations-admin";

export default async function AdminConversationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allConversations = await getConversations();

  // Pre-load messages for all conversations
  const conversationsWithMessages = await Promise.all(
    allConversations.map(async (conv) => ({
      ...conv,
      messages: await getConversationMessages(conv.id),
    }))
  );

  return <ConversationsAdmin conversations={conversationsWithMessages} />;
}
