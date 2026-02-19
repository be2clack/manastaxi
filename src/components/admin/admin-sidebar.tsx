"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Route,
  Mountain,
  Wrench,
  Settings,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/routes", label: "Routes", icon: Route },
  { href: "/admin/tours", label: "Tours", icon: Mountain },
  { href: "/admin/services", label: "Services", icon: Wrench },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-gray-50 lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 px-3">
          <h2 className="text-lg font-bold text-taxi-blue">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Manas Taxi</p>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive =
              item.href === "/admin"
                ? pathname === fullHref
                : pathname.startsWith(fullHref);

            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-taxi-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="mt-4 w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
