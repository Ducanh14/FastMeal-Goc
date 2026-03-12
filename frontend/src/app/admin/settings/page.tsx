"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Save,
  X,
  Store,
} from "lucide-react";
import {
  fetchAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  Branch,
  CreateBranchInput,
} from "@/lib/admin-api";

const emptyForm: CreateBranchInput = {
  name: "",
  address: "",
  phone: "",
  openingHours: "",
  district: "",
  city: "",
  isActive: true,
};

export default function SettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBranchInput>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBranches();
      setBranches(data);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEditForm = (branch: Branch) => {
    setEditingId(branch._id);
    setForm({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      openingHours: branch.openingHours || "",
      district: branch.district || "",
      city: branch.city || "",
      isActive: branch.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateBranch(editingId, form);
      } else {
        await createBranch(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      loadBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      alert("Không thể lưu chi nhánh");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBranch(id);
      setDeleteConfirm(null);
      loadBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      alert("Không thể xóa chi nhánh");
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      await updateBranch(branch._id, { isActive: !branch.isActive });
      loadBranches();
    } catch (error) {
      console.error("Error toggling branch:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý chi nhánh</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#ff5722] text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} />
          Thêm chi nhánh
        </button>
      </div>

      {/* Branch list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : branches.length === 0 ? (
        <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-12 text-center">
          <Store size={48} className="mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold text-gray-400">Chưa có chi nhánh nào</h3>
          <p className="text-gray-500 mt-2 text-sm">
            Nhấn &quot;Thêm chi nhánh&quot; để tạo chi nhánh đầu tiên
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {branches.map((branch) => (
            <div
              key={branch._id}
              className={`bg-[#1a2332] border rounded-xl p-5 transition-colors ${
                branch.isActive
                  ? "border-[#243447]"
                  : "border-red-900/30 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{branch.name}</h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        branch.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {branch.isActive ? "Đang hoạt động" : "Tạm đóng"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#FF6B35] shrink-0" />
                      <span>{branch.address}</span>
                      {(branch.district || branch.city) && (
                        <span className="text-gray-500">
                          {[branch.district, branch.city].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#FF6B35] shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                    {branch.openingHours && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#FF6B35] shrink-0" />
                        <span>{branch.openingHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(branch)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      branch.isActive
                        ? "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"
                        : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                    }`}
                  >
                    {branch.isActive ? "Tạm đóng" : "Mở lại"}
                  </button>
                  <button
                    onClick={() => openEditForm(branch)}
                    className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  {deleteConfirm === branch._id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(branch._id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-[#243447] text-gray-300 text-xs font-medium rounded-lg hover:bg-[#2d4259] transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(branch._id)}
                      className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-[#1a2332] w-full max-w-lg rounded-2xl border border-[#243447] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#243447]">
              <h3 className="text-lg font-bold text-white">
                {editingId ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên chi nhánh <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: FastMeal Quận 1"
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Địa chỉ <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="VD: 123 Nguyễn Huệ, Quận 1"
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={form.district || ""}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                    placeholder="VD: Quận 1"
                    className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Thành phố</label>
                  <input
                    type="text"
                    value={form.city || ""}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="VD: TP.HCM"
                    className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Số điện thoại <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="VD: 0901234567"
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Giờ mở cửa</label>
                <input
                  type="text"
                  value={form.openingHours || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, openingHours: e.target.value }))
                  }
                  placeholder="VD: 08:00 - 22:00"
                  className="w-full bg-[#243447] text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] border border-[#344a60]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400">Trạng thái:</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isActive ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      form.isActive ? "translate-x-5" : ""
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-300">
                  {form.isActive ? "Đang hoạt động" : "Tạm đóng"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg bg-[#243447] text-gray-300 text-sm font-medium hover:bg-[#2d4259] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  saving || !form.name.trim() || !form.address.trim() || !form.phone.trim()
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#FF6B35] text-white text-sm font-bold hover:bg-[#ff5722] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo chi nhánh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
