"use client";

import { Plus, CalendarDays, Search, SlidersHorizontal } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState, useMemo } from "react";
import { fetchTodayMenu, fetchDishes, type Dish } from "@/lib/api";

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

const DAY_NAMES_VI = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export default function MenuSection() {
  const { addToCart } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDailyMenu, setHasDailyMenu] = useState(false);
  const [todayLabel, setTodayLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");

  // Extract unique categories from dishes
  const categories = useMemo(() => {
    const cats = new Set(dishes.map((d) => d.category || "Khác"));
    return ["all", ...Array.from(cats)];
  }, [dishes]);

  // Filter and sort dishes
  const filteredDishes = useMemo(() => {
    let result = dishes;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((d) => (d.category || "Khác") === selectedCategory);
    }

    // Sort
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [dishes, searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        const now = new Date();
        setTodayLabel(DAY_NAMES_VI[now.getDay()]);

        const dailyMenu = await fetchTodayMenu();

        // Nếu có thực đơn theo ngày và có món ăn
        if (dailyMenu && dailyMenu.dishes && dailyMenu.dishes.length > 0) {
          setDishes(dailyMenu.dishes);
          setHasDailyMenu(true);
        } else {
          // Fallback: hiển thị tất cả món ăn có sẵn
          const allDishes = await fetchDishes();
          setDishes(allDishes.filter((d) => d.isAvailable));
          setHasDailyMenu(false);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to load menu:", err);
        setError("Không thể tải thực đơn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, []);

  return (
    <section id="menu" className="bg-[#1a2332] py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center mb-2">
          <span className="text-white">THỰC </span>
          <span className="text-[#FF6B35]">ĐƠN</span>
        </h2>

        {/* Today label */}
        {!loading && (
          <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
            <CalendarDays size={16} className="text-[#FF6B35]" />
            {hasDailyMenu ? (
              <p className="text-gray-400 text-sm">
                Thực đơn hôm nay –{" "}
                <span className="text-[#FF6B35] font-semibold">{todayLabel}</span>
              </p>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Chưa có thực đơn cho{" "}
                <span className="text-gray-400 font-semibold">{todayLabel}</span>
                {" "}– Hiển thị tất cả món có sẵn
              </p>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        {!loading && !error && dishes.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm món ăn..."
                className="w-full bg-[#243447] border border-[#344a60] rounded-full pl-11 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
            </div>

            {/* Category Tabs + Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20"
                        : "bg-[#243447] text-gray-300 hover:bg-[#2d4259] hover:text-white"
                    }`}
                  >
                    {cat === "all" ? "Tất cả" : cat}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "default" | "price-asc" | "price-desc")
                  }
                  className="bg-[#243447] border border-[#344a60] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-[#FF6B35] transition-colors"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Dishes grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredDishes.map((dish) => (
              <div
                key={dish._id}
                className="bg-[#243447] rounded-lg overflow-hidden border border-[#243447] hover:border-[#FF6B35]/50 transition-all duration-300 group active:scale-[0.98]"
              >
                {/* Image */}
                <div className="relative h-32 sm:h-36 lg:h-40 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backgroundImage: dish.imageUrl
                        ? `url('${dish.imageUrl}')`
                        : "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')",
                      backgroundColor: "#3d3d3d",
                    }}
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                      {dish.name}
                    </h4>
                    <span className="text-[#FF6B35] font-bold text-xs sm:text-sm whitespace-nowrap">
                      {formatPrice(dish.price)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] sm:text-xs mb-2.5 line-clamp-2">
                    {dish.description || "Món ăn ngon từ bếp của chúng tôi"}
                  </p>
                  <button
                    onClick={() =>
                      addToCart({
                        id: dish._id,
                        name: dish.name,
                        price: dish.price,
                        image:
                          dish.imageUrl ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
                      })
                    }
                    className="w-full bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] text-white font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && dishes.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chưa có món ăn nào trong thực đơn hôm nay.</p>
          </div>
        )}

        {!loading && !error && dishes.length > 0 && filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Không tìm thấy món ăn phù hợp</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSortBy("default"); }}
              className="mt-3 text-[#FF6B35] hover:text-[#ff5722] text-sm font-medium transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
