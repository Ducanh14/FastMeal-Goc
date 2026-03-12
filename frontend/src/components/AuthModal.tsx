"use client";

import { X, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function AuthModal() {
  const { isAuthOpen, authMode, closeAuth, login, register, openAuth, isLoading } =
    useAuth();

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setIdentifier("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(identifier, password);
    if (!success) {
      setError("Tài khoản hoặc mật khẩu không đúng!");
    } else {
      resetForm();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    const success = await register(name, email, password);
    if (!success) {
      setError("Email đã được sử dụng!");
    } else {
      resetForm();
    }
  };

  const switchMode = (mode: "login" | "register") => {
    resetForm();
    openAuth(mode);
  };

  if (!isAuthOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4"
        onClick={closeAuth}
      >
        {/* Modal */}
        <div
          className="bg-[#1a2332] w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-[#243447] shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto safe-bottom"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#243447] sticky top-0 bg-[#1a2332] z-10">
            <h2 className="text-2xl font-extrabold italic text-white">
              {authMode === "login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
            </h2>
            <button
              onClick={closeAuth}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={authMode === "login" ? handleLogin : handleRegister}
            className="p-5 sm:p-6 space-y-4"
          >
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Register: Name field */}
            {authMode === "register" && (
              <div>
                <label className="block text-white text-sm font-bold mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ tên"
                    required
                    className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Identifier (login) hoặc Email (register) */}
            {authMode === "login" ? (
              <div>
                <label className="block text-white text-sm font-bold mb-1.5">
                  Email hoặc tên đăng nhập
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email hoặc username"
                    required
                    className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-white text-sm font-bold mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-bold mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                />
              </div>
            </div>

            {/* Confirm password (register) */}
            {authMode === "register" && (
              <div>
                <label className="block text-white text-sm font-bold mb-1.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full bg-[#243447] border border-[#243447] rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] text-white font-extrabold italic text-lg py-3 rounded-xl transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Đang xử lý..."
                : authMode === "login"
                  ? "ĐĂNG NHẬP"
                  : "ĐĂNG KÝ"}
            </button>

            {/* Switch mode */}
            <div className="text-center text-gray-400 text-sm">
              {authMode === "login" ? (
                <>
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="text-[#FF6B35] hover:text-[#ff5722] font-bold"
                  >
                    Đăng ký ngay
                  </button>
                </>
              ) : (
                <>
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="text-[#FF6B35] hover:text-[#ff5722] font-bold"
                  >
                    Đăng nhập
                  </button>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
