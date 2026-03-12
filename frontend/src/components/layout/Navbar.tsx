"use client";

import { ShoppingCart, User, LogOut, FileText, Menu, X, Settings } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user, openAuth, logout, openOrderHistory } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-14 sm:h-16">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <span className="text-xl sm:text-2xl font-extrabold tracking-wide">
              <span className="text-white">FAST</span>
              <span className="text-[#FF6B35]">MEAL</span>
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <a
              href="#locations"
              className="text-gray-200 hover:text-[#FF6B35] transition-colors text-sm font-medium"
            >
              Chi nhánh
            </a>
            <a
              href="#menu"
              className="text-gray-200 hover:text-[#FF6B35] transition-colors text-sm font-medium"
            >
              Thực đơn
            </a>
            <a
              href="#rewards"
              className="text-gray-200 hover:text-[#FF6B35] transition-colors text-sm font-medium"
            >
              Ưu đãi
            </a>
          </div>

          {/* Right section */}
          <div className="flex items-center justify-end space-x-2">
            {/* Admin Button (for admin users) */}
            {user?.role === 'admin' && (
              <a
                href="/admin"
                className="hidden md:flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                <Settings size={16} />
                <span>Quản trị</span>
              </a>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative text-gray-200 hover:text-[#FF6B35] transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF6B35] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-[#FF6B35] transition-colors text-sm"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a2332] border border-[#243447] rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={() => {
                        openOrderHistory();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#243447] hover:text-[#FF6B35] transition-colors"
                    >
                      <FileText size={16} />
                      <span>Lịch sử đơn hàng</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-[#243447] hover:text-red-400 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => openAuth("login")}
                  className="text-gray-300 hover:text-[#FF6B35] transition-colors text-xs font-medium"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuth("register")}
                  className="bg-[#FF6B35] hover:bg-[#ff5722] text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-200 hover:text-[#FF6B35]"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-[#1a2332]/95 backdrop-blur-md border-t border-[#243447] overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-4 space-y-1">
          <a
            href="#locations"
            className="block text-gray-300 hover:text-[#FF6B35] active:text-[#FF6B35] font-medium py-2.5 rounded-lg px-3 hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Chi nhánh
          </a>
          <a
            href="#menu"
            className="block text-gray-300 hover:text-[#FF6B35] active:text-[#FF6B35] font-medium py-2.5 rounded-lg px-3 hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Thực đơn
          </a>
          <a
            href="#rewards"
            className="block text-gray-300 hover:text-[#FF6B35] active:text-[#FF6B35] font-medium py-2.5 rounded-lg px-3 hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ưu đãi
          </a>
          <div className="pt-3 mt-2 border-t border-[#243447]">
            {user ? (
              <>
                <div className="text-gray-300 font-medium mb-2 flex items-center space-x-2 px-3">
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
                {user.role === 'admin' && (
                  <a
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left text-purple-400 hover:text-purple-300 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors flex items-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Quản trị</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    openOrderHistory();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-300 hover:text-[#FF6B35] py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Lịch sử đơn hàng
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-red-400 hover:text-red-300 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex space-x-3 px-3 py-2">
                <button
                  onClick={() => {
                    openAuth("login");
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-[#FF6B35] font-medium py-2"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    openAuth("register");
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#FF6B35] active:bg-[#e64a19] text-white px-5 py-2 rounded-lg font-bold transition-colors"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
