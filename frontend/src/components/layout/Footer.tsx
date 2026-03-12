"use client";

import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f1419] border-t border-[#243447]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="text-2xl font-extrabold mb-4">
              <span className="text-white">FAST</span>
              <span className="text-[#FF6B35]">MEAL</span>
            </div>
            <p className="text-gray-400 mb-6">
              Mang đến hương vị đậm đà và sự giòn hoàn hảo tận cửa nhà bạn.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-[#243447] flex items-center justify-center text-gray-400 hover:text-[#FF6B35] hover:border-[#FF6B35] transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-[#243447] flex items-center justify-center text-gray-400 hover:text-[#FF6B35] hover:border-[#FF6B35] transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-[#243447] flex items-center justify-center text-gray-400 hover:text-[#FF6B35] hover:border-[#FF6B35] transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-extrabold text-lg mb-4">
              Liên kết nhanh
            </h3>
            <ul className="space-y-3">
              {["Thực đơn", "Chi nhánh", "Chương trình ưu đãi", "Tuyển dụng"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#FF6B35] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-extrabold text-lg mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={16} className="text-[#FF6B35] shrink-0" />
                <span>1900-FASTMEAL</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={16} className="text-[#FF6B35] shrink-0" />
                <span>hello@fastmeal.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin size={16} className="text-[#FF6B35] shrink-0" />
                <span>Tìm chi nhánh gần bạn</span>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-extrabold text-lg mb-4">
              Tải Ứng dụng
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-1 gap-3">
              <a
                href="#"
                className="flex items-center space-x-3 bg-black border border-[#243447] rounded-xl px-4 sm:px-5 py-3 hover:border-[#FF6B35] active:border-[#FF6B35] transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-gray-400 text-xs">Tải về trên</div>
                  <div className="text-white font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 bg-black border border-[#243447] rounded-xl px-4 sm:px-5 py-3 hover:border-[#FF6B35] active:border-[#FF6B35] transition-colors"
              >
                <svg
                  className="w-6 h-6 text-white shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div>
                  <div className="text-gray-400 text-xs">Tải về trên</div>
                  <div className="text-white font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#243447]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 FastMeal. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6 text-xs sm:text-sm">
            {["Chính sách bảo mật", "Điều khoản dịch vụ", "Truy cập", "Quản trị"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
