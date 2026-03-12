"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAllDishes,
  fetchWeeklyMenus,
  saveWeeklyMenus,
  type Dish,
  type WeeklyMenus,
} from "@/lib/admin-api";
import { Save, Plus, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DAYS = [
  { en: "Monday", vi: "Thứ Hai" },
  { en: "Tuesday", vi: "Thứ Ba" },
  { en: "Wednesday", vi: "Thứ Tư" },
  { en: "Thursday", vi: "Thứ Năm" },
  { en: "Friday", vi: "Thứ Sáu" },
  { en: "Saturday", vi: "Thứ Bảy" },
  { en: "Sunday", vi: "Chủ Nhật" },
];

function getMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
}

// Modal to select dishes for a day
function DishSelectorModal({
  allDishes,
  selectedIds,
  onClose,
  onSave,
  dayName,
}: {
  allDishes: Dish[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
  dayName: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2332] border border-[#243447] rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#243447]">
          <div>
            <h2 className="text-lg font-bold">Chỉnh sửa thực đơn</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {dayName} – Đã chọn {selected.size} món
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allDishes
              .filter((d) => d.isAvailable)
              .map((dish) => {
                const isSelected = selected.has(dish._id);
                return (
                  <button
                    key={dish._id}
                    onClick={() => toggle(dish._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "border-[#FF6B35] bg-[#FF6B35]/10"
                        : "border-[#243447] bg-[#243447] hover:border-[#243447]"
                    }`}
                  >
                    <div
                      className="w-14 h-14 rounded-lg bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage: dish.imageUrl
                          ? `url('${dish.imageUrl}')`
                          : "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')",
                        backgroundColor: "#3d3d3d",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {dish.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#FF6B35] bg-[#FF6B35]/20 px-1.5 py-0.5 rounded">
                          {dish.category || "Khác"}
                        </span>
                        <span className="text-xs text-[#FF6B35] font-bold">
                          {dish.price.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-[#FF6B35] bg-[#FF6B35]"
                          : "border-[#243447]"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-[#243447]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-[#243447] rounded-lg text-sm text-gray-300 hover:bg-[#243447] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(Array.from(selected))}
            className="flex-1 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] rounded-lg text-sm font-bold transition-colors"
          >
            Xác nhận ({selected.size} món)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WeeklySchedulePage() {
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenus>({});
  // Local state for edits (maps dayIndex -> dishIds)
  const [localMenus, setLocalMenus] = useState<Record<number, string[]>>({});
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  const isReadOnly = user?.role === "staff";

  const monday = getMonday();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dishes, menus] = await Promise.all([
        fetchAllDishes(),
        fetchWeeklyMenus(monday),
      ]);
      setAllDishes(dishes);
      setWeeklyMenus(menus);

      // Initialize local menus from server data
      const local: Record<number, string[]> = {};
      for (let i = 0; i < 7; i++) {
        const dayMenu = menus[i];
        local[i] = dayMenu ? dayMenu.dishes.map((d: Dish) => d._id) : [];
      }
      setLocalMenus(local);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [monday]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveDishes = (ids: string[]) => {
    setLocalMenus((prev) => ({ ...prev, [selectedDay]: ids }));
    setHasChanges(true);
    setShowSelector(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const menus = [];
      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(monday + 'T00:00:00');
        dateObj.setDate(dateObj.getDate() + i);
        const dateStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
        menus.push({ date: dateStr, dishIds: localMenus[i] || [] });
      }
      await saveWeeklyMenus(menus);
      await loadData();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Lỗi khi lưu! Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // Get the dish objects for the currently selected day
  const selectedDayDishes: Dish[] = (localMenus[selectedDay] || [])
    .map((id) => allDishes.find((d) => d._id === id))
    .filter(Boolean) as Dish[];

  const selectedDayDate = (() => {
    const d = new Date(monday);
    d.setDate(d.getDate() + selectedDay);
    return d;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isReadOnly ? "Thực đơn theo tuần" : "Quản lý thực đơn theo tuần"}
        </h1>
        {!isReadOnly && (
          <button
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        )}
      </div>

      {/* Day selector */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Chọn ngày trong tuần</h2>
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((day, index) => {
            const isActive = selectedDay === index;
            const dishCount = (localMenus[index] || []).length;
            return (
              <button
                key={day.en}
                onClick={() => setSelectedDay(index)}
                className={`rounded-xl p-4 text-center transition-all border ${
                  isActive
                    ? "border-[#FF6B35] bg-[#1a2332]"
                    : "border-[#243447] bg-[#1a2332] hover:border-[#243447]"
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    isActive ? "text-[#FF6B35]" : "text-gray-300"
                  }`}
                >
                  {day.vi}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{day.en}</p>
                <div
                  className={`w-10 h-10 rounded-full mx-auto mt-3 flex items-center justify-center text-lg font-bold ${
                    isActive
                      ? "bg-[#FF6B35] text-white"
                      : "bg-[#243447] text-gray-300"
                  }`}
                >
                  {dishCount}
                </div>
                <p
                  className={`text-xs mt-2 ${
                    isActive ? "text-[#FF6B35]" : "text-gray-500"
                  }`}
                >
                  Món
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day menu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">
            Thực đơn {DAYS[selectedDay].vi}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {selectedDayDishes.length} món hiện có
            </span>
            {!isReadOnly && (
              <button
                onClick={() => setShowSelector(true)}
                className="flex items-center gap-2 border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                <Plus size={14} />
                Chỉnh sửa thực đơn
              </button>
            )}
          </div>
        </div>

        {selectedDayDishes.length === 0 ? (
          <div className="text-center py-12 bg-[#1a2332] border border-[#243447] rounded-xl">
            <p className="text-gray-400 mb-3">
              Chưa có món ăn nào cho {DAYS[selectedDay].vi}
            </p>
            {!isReadOnly && (
              <button
                onClick={() => setShowSelector(true)}
                className="text-[#FF6B35] hover:text-[#ff5722] text-sm font-bold"
              >
                + Thêm món ăn
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedDayDishes.map((dish) => (
              <div
                key={dish._id}
                className="bg-[#1a2332] border border-[#243447] rounded-xl overflow-hidden"
              >
                <div
                  className="h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: dish.imageUrl
                      ? `url('${dish.imageUrl}')`
                      : "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')",
                    backgroundColor: "#2d2d2d",
                  }}
                />
                <div className="p-4">
                  <span className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded">
                    {dish.category || "Khác"}
                  </span>
                  <h3 className="font-bold text-white mt-2">{dish.name}</h3>
                  <p className="text-[#FF6B35] font-bold mt-1">
                    {dish.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dish Selector Modal */}
      {showSelector && (
        <DishSelectorModal
          allDishes={allDishes}
          selectedIds={localMenus[selectedDay] || []}
          dayName={DAYS[selectedDay].vi}
          onClose={() => setShowSelector(false)}
          onSave={handleSaveDishes}
        />
      )}
    </div>
  );
}
