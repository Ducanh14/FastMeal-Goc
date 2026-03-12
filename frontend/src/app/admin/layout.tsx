"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
  Settings,
  ArrowLeft,
  User,
  Users,
  MessageCircle,
  Store,
} from "lucide-react";

const allSidebarItems = [
  { label: "Tổng quan", href: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Quản lý thực đơn", href: "/admin/menu", icon: UtensilsCrossed, roles: ["admin"] },
  { label: "Lịch tuần", href: "/admin/weekly-schedule", icon: CalendarDays, roles: ["admin", "staff"] },
  { label: "Đơn hàng", href: "/admin/orders", icon: ClipboardList, roles: ["admin", "staff"] },
  { label: "Người dùng", href: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Trò chuyện", href: "/admin/chat", icon: MessageCircle, roles: ["admin", "staff"] },
  { label: "Chi nhánh", href: "/admin/settings", icon: Store, roles: ["admin"] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || "admin";

  const sidebarItems = allSidebarItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex min-h-screen bg-[#0f1419] text-white">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a2332] border-r border-[#243447] flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#243447]">
          <h1 className="text-xl font-extrabold text-[#FF6B35]">FastMeal</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {userRole === "staff" ? "Bảng nhân viên" : "Bảng điều khiển"}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#FF6B35] text-white"
                    : "text-gray-300 hover:bg-[#243447] hover:text-white"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 space-y-2 border-t border-[#243447] pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Quay lại cửa hàng
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-400">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-6 lg:p-8">{children}</main>
    </div>
  );
}
