"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllDishes, type Dish } from "@/lib/admin-api";
import { UtensilsCrossed, DollarSign, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect staff to orders page
  useEffect(() => {
    if (user?.role === "staff") {
      router.replace("/admin/orders");
    }
  }, [user, router]);

  useEffect(() => {
    fetchAllDishes()
      .then(setDishes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalDishes = dishes.length;
  const availableDishes = dishes.filter((d) => d.isAvailable).length;
  const unavailableDishes = totalDishes - availableDishes;
  const avgPrice =
    totalDishes > 0
      ? (dishes.reduce((s, d) => s + d.price, 0) / totalDishes).toFixed(0)
      : "0";

  const stats = [
    {
      label: "Tổng món ăn",
      value: totalDishes,
      icon: UtensilsCrossed,
      color: "text-[#FF6B35]",
      bg: "bg-[#FF6B35]/10",
    },
    {
      label: "Đang phục vụ",
      value: availableDishes,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Ngừng phục vụ",
      value: unavailableDishes,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Giá trung bình",
      value: Number(avgPrice).toLocaleString("vi-VN") + "đ",
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35]" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#1a2332] border border-[#243447] rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent dishes */}
          <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-5">
            <h2 className="text-lg font-bold mb-4">Món ăn gần đây</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#243447] text-gray-400">
                    <th className="text-left py-3 px-2">Tên món</th>
                    <th className="text-left py-3 px-2">Danh mục</th>
                    <th className="text-left py-3 px-2">Giá</th>
                    <th className="text-left py-3 px-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dishes.slice(0, 10).map((dish) => (
                    <tr
                      key={dish._id}
                      className="border-b border-[#243447]/50 hover:bg-[#243447]/30"
                    >
                      <td className="py-3 px-2 font-medium">{dish.name}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded">
                          {dish.category || "Khác"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[#FF6B35] font-bold">
                        {dish.price.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="py-3 px-2">
                        {dish.isAvailable ? (
                          <span className="text-green-400 text-xs">● Đang phục vụ</span>
                        ) : (
                          <span className="text-red-400 text-xs">● Ngừng phục vụ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
