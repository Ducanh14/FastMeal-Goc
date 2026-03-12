"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAllDishes,
  createDish,
  updateDish,
  deleteDish,
  type Dish,
  type CreateDishInput,
} from "@/lib/admin-api";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

const CATEGORIES = ["Gà", "Cơm", "Mì & Phở", "Bánh mì", "Đồ chiên", "Salad", "Đồ uống", "Tráng miệng", "Khác"];

function DishFormModal({
  dish,
  onClose,
  onSave,
}: {
  dish: Dish | null;
  onClose: () => void;
  onSave: (data: CreateDishInput) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateDishInput>({
    name: dish?.name || "",
    description: dish?.description || "",
    price: dish?.price || 0,
    imageUrl: dish?.imageUrl || "",
    category: dish?.category || "Khác",
    isAvailable: dish?.isAvailable ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch {
      alert("Lỗi khi lưu món ăn!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2332] border border-[#243447] rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#243447]">
          <h2 className="text-lg font-bold">
            {dish ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tên món *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#243447] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
              placeholder="VD: Cánh gà BBQ"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-[#243447] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none resize-none"
              rows={2}
              placeholder="Mô tả ngắn về món ăn"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Giá (VNĐ) *</label>
              <input
                type="number"
                required
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#243447] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[#243447] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">URL hình ảnh</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-[#243447] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="accent-[#FF6B35]"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-300">
              Đang phục vụ
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#243447] rounded-lg text-sm text-gray-300 hover:bg-[#243447] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : dish ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const loadDishes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllDishes();
      setDishes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  const handleCreate = async (data: CreateDishInput) => {
    await createDish(data);
    loadDishes();
  };

  const handleUpdate = async (data: CreateDishInput) => {
    if (!editDish) return;
    await updateDish(editDish._id, data);
    loadDishes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa món ăn này?")) return;
    await deleteDish(id);
    loadDishes();
  };

  const filteredDishes = dishes.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === "all" || d.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý món ăn</h1>
        <button
          onClick={() => {
            setEditDish(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#ff5722] active:bg-[#e64a19] px-4 py-2.5 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          Thêm món ăn
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a2332] border border-[#243447] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#1a2332] border border-[#243447] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#FF6B35] focus:outline-none"
        >
          <option value="all">Tất cả danh mục</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDishes.map((dish) => (
            <div
              key={dish._id}
              className={`bg-[#1a2332] border rounded-xl overflow-hidden transition-all ${
                dish.isAvailable ? "border-[#243447]" : "border-red-900/50 opacity-60"
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: dish.imageUrl
                      ? `url('${dish.imageUrl}')`
                      : "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80')",
                    backgroundColor: "#2d2d2d",
                  }}
                />
                {!dish.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                      Ngừng phục vụ
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded">
                    {dish.category || "Khác"}
                  </span>
                  <span className="text-[#FF6B35] font-bold text-sm">
                    {dish.price.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <h3 className="font-bold text-white mt-2 mb-1">{dish.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-3">
                  {dish.description || "Không có mô tả"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditDish(dish);
                      setShowForm(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-[#243447] rounded-lg text-xs text-gray-300 hover:bg-[#243447] hover:text-white transition-colors"
                  >
                    <Pencil size={13} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(dish._id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 border border-red-900/50 rounded-lg text-xs text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredDishes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Không tìm thấy món ăn nào.</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <DishFormModal
          dish={editDish}
          onClose={() => {
            setShowForm(false);
            setEditDish(null);
          }}
          onSave={editDish ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
