"use client";

import { X, ChevronDown, Pencil, Trash2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { fetchUserOrders, updateOrder, cancelOrder, OrderData } from "@/lib/api";

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

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: "Chờ xác nhận", color: "bg-yellow-500/20 text-yellow-400" },
  confirmed: { text: "Đã xác nhận", color: "bg-blue-500/20 text-blue-400" },
  preparing: { text: "Đang chuẩn bị", color: "bg-purple-500/20 text-purple-400" },
  delivering: { text: "Đang giao", color: "bg-orange-500/20 text-orange-400" },
  completed: { text: "Hoàn thành", color: "bg-green-500/20 text-green-400" },
  cancelled: { text: "Đã hủy", color: "bg-red-500/20 text-red-400" },
};

export default function OrderHistory() {
  const { isOrderHistoryOpen, closeOrderHistory, user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilter, setShowFilter] = useState(false);
  const limit = 10;

  // Edit state
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);
  const [editForm, setEditForm] = useState({ customerName: "", phone: "", address: "", note: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await fetchUserOrders(user.id, {
        status: filterStatus || undefined,
        page,
        limit,
      });
      setOrders(result.orders);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user, page, filterStatus]);

  useEffect(() => {
    if (isOrderHistoryOpen && user) {
      setPage(1);
      loadOrders();
    }
  }, [isOrderHistoryOpen, user, filterStatus]);

  useEffect(() => {
    if (isOrderHistoryOpen && user) {
      loadOrders();
    }
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const handleEdit = (order: OrderData) => {
    setEditingOrder(order);
    setEditForm({
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      note: order.note || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingOrder || !user) return;
    setActionLoading(editingOrder._id);
    try {
      await updateOrder(editingOrder._id, user.id, {
        customerName: editForm.customerName,
        phone: editForm.phone,
        address: editForm.address,
        note: editForm.note,
      });
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      alert(error instanceof Error ? error.message : "Không thể cập nhật đơn hàng");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!user) return;
    setActionLoading(orderId);
    try {
      await cancelOrder(orderId, user.id);
      setCancelConfirm(null);
      loadOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error instanceof Error ? error.message : "Không thể hủy đơn hàng");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOrderHistoryOpen || !user) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={closeOrderHistory}
      >
        {/* Modal */}
        <div
          className="bg-[#1a2332] w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] rounded-t-2xl sm:rounded-2xl border border-[#243447] shadow-2xl overflow-hidden flex flex-col safe-bottom"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#243447]">
            <h2 className="text-xl sm:text-2xl font-extrabold italic text-white">
              LỊCH SỬ ĐƠN HÀNG
            </h2>
            <button
              onClick={closeOrderHistory}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Filter */}
          <div className="px-4 sm:px-6 pt-4">
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center gap-2 bg-[#243447] hover:bg-[#2d4259] text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                {filterStatus
                  ? statusLabels[filterStatus]?.text || "Tất cả"
                  : "Lọc theo trạng thái"}
                <ChevronDown size={16} />
              </button>
              {showFilter && (
                <div className="absolute top-full left-0 mt-1 bg-[#243447] border border-[#344a60] rounded-lg shadow-xl z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setFilterStatus("");
                      setShowFilter(false);
                      setPage(1);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#2d4259] transition-colors ${
                      !filterStatus ? "text-[#FF6B35]" : "text-white"
                    }`}
                  >
                    Tất cả
                  </button>
                  {Object.entries(statusLabels).map(([key, { text }]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setFilterStatus(key);
                        setShowFilter(false);
                        setPage(1);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#2d4259] transition-colors ${
                        filterStatus === key ? "text-[#FF6B35]" : "text-white"
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-400">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-gray-500 mt-2">
                  Đơn hàng của bạn sẽ hiển thị ở đây
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const statusInfo = statusLabels[order.status] || {
                    text: order.status,
                    color: "bg-gray-500/20 text-gray-400",
                  };
                  return (
                    <div
                      key={order._id}
                      className="bg-[#243447] rounded-xl border border-[#243447] overflow-hidden"
                    >
                      {/* Order header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 bg-[#1a2332] border-b border-[#243447]">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-[#FF6B35] font-bold text-xs sm:text-sm">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-gray-400 text-xs sm:text-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Order items */}
                      <div className="p-4">
                        <div className="space-y-2 mb-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-300">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-[#FF6B35] font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-[#344a60] pt-3 flex justify-between">
                          <span className="text-white font-bold">
                            Tổng cộng:
                          </span>
                          <span className="text-[#FF6B35] font-extrabold text-lg">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        {/* Delivery info */}
                        <div className="mt-3 pt-3 border-t border-[#344a60] text-xs sm:text-sm text-gray-400 space-y-1">
                          <p className="flex flex-wrap gap-x-2">
                            <span>👤 {order.customerName}</span>
                            <span>📞 {order.phone}</span>
                          </p>
                          <p className="break-words">📍 {order.address}</p>
                          {order.note && (
                            <p className="break-words">📝 {order.note}</p>
                          )}
                        </div>

                        {/* Edit / Cancel buttons for pending orders */}
                        {order.status === "pending" && (
                          <div className="mt-3 pt-3 border-t border-[#344a60] flex gap-2">
                            <button
                              onClick={() => handleEdit(order)}
                              disabled={actionLoading === order._id}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Pencil size={14} />
                              Chỉnh sửa
                            </button>
                            {cancelConfirm === order._id ? (
                              <div className="flex-1 flex gap-1">
                                <button
                                  onClick={() => handleCancel(order._id)}
                                  disabled={actionLoading === order._id}
                                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === order._id ? "Đang hủy..." : "Xác nhận"}
                                </button>
                                <button
                                  onClick={() => setCancelConfirm(null)}
                                  className="flex-1 bg-[#344a60] text-gray-300 text-sm font-medium py-2 rounded-lg hover:bg-[#3d5570] transition-colors"
                                >
                                  Không
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancelConfirm(order._id)}
                                disabled={actionLoading === order._id}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={14} />
                                Hủy đơn
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg bg-[#243447] text-white text-sm hover:bg-[#2d4259] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹ Trước
                    </button>
                    <span className="text-gray-400 text-sm">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-[#243447] text-white text-sm hover:bg-[#2d4259] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau ›
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setEditingOrder(null)}
        >
          <div
            className="bg-[#1a2332] w-full max-w-md rounded-2xl border border-[#243447] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#243447]">
              <h3 className="text-lg font-bold text-white">
                Chỉnh sửa đơn hàng
              </h3>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tên người nhận</label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ghi chú</label>
                <textarea
                  value={editForm.note}
                  onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                  rows={3}
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#243447] text-gray-300 text-sm font-medium hover:bg-[#2d4259] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading === editingOrder._id || !editForm.customerName.trim() || !editForm.phone.trim() || !editForm.address.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#ff5722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {actionLoading === editingOrder._id ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
