"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { createOrder } from "@/lib/api";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function CartSidebar() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();
  const { user, openAuth } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!user) {
      openAuth("login");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        userId: user.id,
        items: items.map((item) => ({
          dishId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: totalPrice,
        customerName,
        phone,
        address,
        note,
      });

      clearCart();
      setCustomerName("");
      setPhone("");
      setAddress("");
      setNote("");
      setOrderSuccess(true);

      setTimeout(() => {
        setOrderSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill from user data
  const handleAutoFill = () => {
    if (user) {
      setCustomerName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[480px] bg-[#1a2332] z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col safe-bottom`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#243447]">
          <h2 className="text-2xl font-extrabold italic text-white">
            THANH TOÁN
          </h2>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {orderSuccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#FF6B35] mb-2">
                Đặt hàng thành công!
              </h3>
              <p className="text-gray-400">
                Đơn hàng của bạn đang được xử lý. Cảm ơn bạn đã sử dụng
                FastMeal!
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-400">
                Giỏ hàng trống
              </h3>
              <p className="text-gray-500 mt-2">
                Hãy thêm món ăn từ menu nhé!
              </p>
            </div>
          ) : (
            <>
              {/* Order summary */}
              <div className="bg-[#243447] rounded-xl p-5 border border-[#243447]">
                <h3 className="text-lg font-extrabold italic text-white mb-4">
                  Đơn hàng của bạn
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full bg-[#1a2332] hover:bg-[#0f1419] flex items-center justify-center text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-full bg-[#1a2332] hover:bg-[#0f1419] flex items-center justify-center text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-white text-sm truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-[#FF6B35] font-bold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#243447] flex items-center justify-between">
                  <span className="text-white font-extrabold italic text-lg">
                    Tổng cộng:
                  </span>
                  <span className="text-[#FF6B35] font-extrabold italic text-2xl">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Delivery form */}
              <div>
                <h3 className="text-lg font-extrabold italic text-white mb-4">
                  THÔNG TIN GIAO HÀNG
                </h3>

                {user && (
                  <button
                    onClick={handleAutoFill}
                    className="mb-4 text-sm text-[#FF6B35] hover:text-[#ff5722] underline transition-colors"
                  >
                    Tự động điền từ tài khoản
                  </button>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-bold mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-bold mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ví dụ: 0912345678"
                      className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-bold mb-1.5">
                      Địa chỉ nhận hàng{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ giao hàng"
                      className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-bold mb-1.5">
                      Ghi chú
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú cho đơn hàng (tuỳ chọn)"
                      rows={3}
                      className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Submit button */}
        {items.length > 0 && !orderSuccess && (
          <div className="p-4 sm:p-6 border-t border-[#243447]">
            {!user && (
              <p className="text-yellow-400 text-sm mb-3 text-center">
                ⚠️ Bạn cần đăng nhập để đặt hàng
              </p>
            )}
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] text-white font-extrabold italic text-lg py-4 rounded-xl transition-colors uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "ĐANG XỬ LÝ..."
                : user
                ? "XÁC NHẬN ĐẶT HÀNG"
                : "ĐĂNG NHẬP ĐỂ ĐẶT HÀNG"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
