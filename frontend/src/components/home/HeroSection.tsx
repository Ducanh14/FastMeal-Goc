"use client";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[58vh] sm:h-[65vh] lg:h-[70vh] min-h-[435px] flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="text-white block">HƯƠNG VỊ</span>
            <span className="text-[#FF6B35] block">KHÁC BIỆT</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-200 max-w-md">
            Gà giòn rụm. Hương vị đậm đà. Giao tận cửa nhà bạn.
          </p>
          <a
            href="#menu"
            className="mt-4 sm:mt-5 inline-block bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-lg transition-colors uppercase tracking-wide"
          >
            ĐẶT HÀNG NGAY
          </a>
        </div>
      </div>
    </section>
  );
}
