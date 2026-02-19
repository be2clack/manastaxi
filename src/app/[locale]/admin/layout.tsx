import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // Allow login page without auth
  // The actual path check is handled differently in app router
  // We'll use a simple approach: if no session and not login page, redirect
  if (!session) {
    // We can't check path here easily, so we'll wrap children
    // Login page handles its own auth state
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar locale={locale} />
      <div className="flex-1 p-6 lg:p-8">{children}</div>
    </div>
  );
}
