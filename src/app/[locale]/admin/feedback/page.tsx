export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFeedback } from "@/lib/admin-actions";
import { FeedbackAdmin } from "@/components/admin/feedback-admin";

export default async function AdminFeedbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const allFeedback = await getFeedback();
  return <FeedbackAdmin feedback={allFeedback} />;
}
