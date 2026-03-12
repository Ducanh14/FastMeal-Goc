"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAllOrders,
  fetchOrderStats,
  updateOrderStatus,
  AdminOrder,
  OrderStats,
} from "@/lib/admin-api";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

const statusConfig: Record<
  string,
  { text: string; color: string; bgColor: string }
> = {
  pending: {
    text: "Chờ xác nhận",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
  },
  confirmed: {
    text: "Đã xác nhận",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  preparing: {
    text: "Đang chuẩn bị",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  delivering: {
    text: "Đang giao",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
  },
  completed: {
    text: "Hoàn thành",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  cancelled: {
    text: "Đã hủy",
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
};

const statusFlow = [
  "pending",
  "confirmed",
  "preparing",
  "delivering",
  "completed",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const { user } = useAuth();
  const isStaff = user?.role === "staff";

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const limit = 15;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAllOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        page,
        limit,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, startDate, endDate, page, sortBy, sortOrder]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchOrderStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!isStaff) {
      loadStats();
    }
  }, [loadStats, isStaff]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? result.order : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(result.order);
      }
      loadStats();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const totalPages = Math.ceil(total / limit);

  const getUserDisplay = (userId: AdminOrder["userId"]) => {
    if (typeof userId === "object" && userId !== null) {
      return { name: userId.fullName, email: userId.email };
    }
    return { name: "N/A", email: "" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <button
          onClick={() => {
            loadOrders();
            loadStats();
          }}
          className="flex items-center gap-2 bg-[#243447] hover:bg-[#2d4259] text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* Stats Cards - hide revenue stats for staff */}
      {stats && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isStaff ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4`}>
          <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Tổng đơn hàng</p>
                <p className="text-white text-xl font-bold">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>
          {!isStaff && (
            <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tổng doanh thu</p>
                  <p className="text-white text-xl font-bold">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Đơn hôm nay</p>
                <p className="text-white text-xl font-bold">
                  {stats.todayOrders}
                </p>
              </div>
            </div>
          </div>
          {!isStaff && (
            <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Clock size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Doanh thu hôm nay</p>
                  <p className="text-white text-xl font-bold">
                    {formatPrice(stats.todayRevenue)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Quick Filters */}
      {stats && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !statusFilter
                ? "bg-[#FF6B35] text-white"
                : "bg-[#243447] text-gray-300 hover:bg-[#2d4259]"
            }`}
          >
            Tất cả ({stats.totalOrders})
          </button>
          {Object.entries(statusConfig).map(([key, { text }]) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === key
                  ? "bg-[#FF6B35] text-white"
                  : "bg-[#243447] text-gray-300 hover:bg-[#2d4259]"
              }`}
            >
              {text} ({stats.statusCounts[key] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, SĐT, địa chỉ..."
                className="w-full bg-[#243447] border border-[#344a60] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
            </div>
          </form>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-[#243447] border border-[#344a60] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
            <span className="text-gray-400 text-sm">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-[#243447] border border-[#344a60] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split("-");
                setSortBy(sb);
                setSortOrder(so as "asc" | "desc");
                setPage(1);
              }}
              className="bg-[#243447] border border-[#344a60] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF6B35] transition-colors appearance-none pr-8"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="total-desc">Giá cao → thấp</option>
              <option value="total-asc">Giá thấp → cao</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Reset */}
          <button
            onClick={handleResetFilters}
            className="bg-[#243447] hover:bg-[#2d4259] text-gray-300 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1a2332] border border-[#243447] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-400 text-lg">Không tìm thấy đơn hàng</p>
            <p className="text-gray-500 text-sm mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#243447] text-gray-400 text-xs uppercase">
                    <th className="text-left px-4 py-3">Mã đơn</th>
                    <th className="text-left px-4 py-3">Khách hàng</th>
                    <th className="text-left px-4 py-3">Món ăn</th>
                    <th className="text-right px-4 py-3">Tổng tiền</th>
                    <th className="text-center px-4 py-3">Trạng thái</th>
                    <th className="text-left px-4 py-3">Ngày đặt</th>
                    <th className="text-center px-4 py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const userInfo = getUserDisplay(order.userId);
                    const config = statusConfig[order.status] || {
                      text: order.status,
                      color: "text-gray-400",
                      bgColor: "bg-gray-500/20",
                    };
                    return (
                      <tr
                        key={order._id}
                        className="border-b border-[#243447]/50 hover:bg-[#243447]/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-[#FF6B35] font-mono font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">
                              {order.customerName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {order.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-300 truncate max-w-[200px]">
                            {order.items
                              .map((i) => `${i.quantity}x ${i.name}`)
                              .join(", ")}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[#FF6B35] font-bold">
                            {formatPrice(order.total)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className={`${config.bgColor} ${config.color} text-xs font-bold px-3 py-1.5 rounded-full appearance-none cursor-pointer pr-6 focus:outline-none border-0`}
                            >
                              {Object.entries(statusConfig).map(
                                ([key, { text }]) => (
                                  <option key={key} value={key}>
                                    {text}
                                  </option>
                                )
                              )}
                            </select>
                            <ChevronDown
                              size={12}
                              className={`absolute right-1.5 top-1/2 -translate-y-1/2 ${config.color} pointer-events-none`}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-400 text-xs">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-[#243447]/50">
              {orders.map((order) => {
                const config = statusConfig[order.status] || {
                  text: order.status,
                  color: "text-gray-400",
                  bgColor: "bg-gray-500/20",
                };
                return (
                  <div
                    key={order._id}
                    className="p-4 hover:bg-[#243447]/30 transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#FF6B35] font-mono font-medium text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`${config.bgColor} ${config.color} text-xs font-bold px-2.5 py-1 rounded-full`}
                      >
                        {config.text}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {order.customerName}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.phone}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#FF6B35] font-bold text-sm">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {formatShortDate(order.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#243447]">
            <p className="text-gray-400 text-sm">
              Hiển thị {(page - 1) * limit + 1}-
              {Math.min(page * limit, total)} / {total} đơn hàng
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[#243447] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? "bg-[#FF6B35] text-white"
                        : "text-gray-400 hover:bg-[#243447]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-[#243447] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#1a2332] w-full max-w-lg max-h-[85vh] rounded-2xl border border-[#243447] shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-[#243447]">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-[#FF6B35] font-mono text-sm mt-0.5">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                  Trạng thái
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(
                    ([key, { text, color, bgColor }]) => (
                      <button
                        key={key}
                        onClick={() =>
                          handleStatusChange(selectedOrder._id, key)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          selectedOrder.status === key
                            ? `${bgColor} ${color} ring-2 ring-current`
                            : "bg-[#243447] text-gray-400 hover:bg-[#2d4259]"
                        }`}
                      >
                        {text}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                  Thông tin khách hàng
                </label>
                <div className="bg-[#243447] rounded-lg p-4 space-y-2 text-sm">
                  <p className="text-white">
                    <span className="text-gray-400">👤 Tên:</span>{" "}
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">📞 SĐT:</span>{" "}
                    {selectedOrder.phone}
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">📍 Địa chỉ:</span>{" "}
                    {selectedOrder.address}
                  </p>
                  {selectedOrder.note && (
                    <p className="text-white">
                      <span className="text-gray-400">📝 Ghi chú:</span>{" "}
                      {selectedOrder.note}
                    </p>
                  )}
                  {typeof selectedOrder.userId === "object" && (
                    <p className="text-white">
                      <span className="text-gray-400">📧 Email:</span>{" "}
                      {selectedOrder.userId.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                  Sản phẩm ({selectedOrder.items.length} món)
                </label>
                <div className="bg-[#243447] rounded-lg p-4">
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-300">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-[#FF6B35] font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#344a60] mt-3 pt-3 flex justify-between">
                    <span className="text-white font-bold">Tổng cộng:</span>
                    <span className="text-[#FF6B35] font-extrabold text-lg">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Đặt lúc: {formatDate(selectedOrder.createdAt)}</p>
                <p>Cập nhật: {formatDate(selectedOrder.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
