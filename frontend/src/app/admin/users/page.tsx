"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  ChevronDown,
  Check,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { fetchAllUsers, updateUserRole, deleteUser, UserInfo } from "@/lib/admin-api";

const ROLE_CONFIG = {
  customer: {
    label: "Khách hàng",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: Users,
  },
  staff: {
    label: "Nhân viên",
    color: "text-[#FF6B35]",
    bg: "bg-[#FF6B35]/10",
    border: "border-[#FF6B35]/20",
    icon: Shield,
  },
  admin: {
    label: "Quản trị viên",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: ShieldCheck,
  },
} as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserInfo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      showToast("Không thể tải danh sách người dùng", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "customer" | "staff" | "admin"
  ) => {
    try {
      setUpdatingId(userId);
      const result = await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: result.user.role } : u))
      );
      showToast(
        `Đã cập nhật vai trò thành "${ROLE_CONFIG[newRole].label}"`,
        "success"
      );
    } catch (err) {
      console.error("Error updating role:", err);
      showToast("Không thể cập nhật vai trò", "error");
    } finally {
      setUpdatingId(null);
      setEditingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeletingId(userId);
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      showToast("Xóa người dùng thành công", "success");
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast("Không thể xóa người dùng", "error");
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || user.role === filterRole;
    return matchSearch && matchRole;
  });

  // Stats
  const stats = {
    total: users.length,
    customer: users.filter((u) => u.role === "customer").length,
    staff: users.filter((u) => u.role === "staff").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCog className="text-[#FF6B35]" size={28} />
          Quản lý người dùng
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Quản lý vai trò và thông tin người dùng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] border border-[#243447] rounded-xl p-4">
          <p className="text-gray-400 text-xs">Tổng người dùng</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#1a2332] border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-400 text-xs">Khách hàng</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {stats.customer}
          </p>
        </div>
        <div className="bg-[#1a2332] border border-[#FF6B35]/20 rounded-xl p-4">
          <p className="text-[#FF6B35] text-xs">Nhân viên</p>
          <p className="text-2xl font-bold text-[#FF6B35] mt-1">
            {stats.staff}
          </p>
        </div>
        <div className="bg-[#1a2332] border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-xs">Quản trị viên</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {stats.admin}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a2332] border border-[#243447] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-[#1a2332] border border-[#243447] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#FF6B35] cursor-pointer"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a2332] border border-[#243447] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#FF6B35]" />
            <span className="ml-2 text-gray-400">Đang tải...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Users size={40} className="mx-auto mb-3" />
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#243447] text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243447]/50">
              {filteredUsers.map((user) => {
                const roleConf =
                  ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] ||
                  ROLE_CONFIG.customer;
                const RoleIcon = roleConf.icon;
                const isEditing = editingUserId === user._id;
                const isUpdating = updatingId === user._id;

                return (
                  <tr
                    key={user._id}
                    className="hover:bg-[#243447]/30 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#ff5722] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {user.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-400">
                        {user.email}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleConf.bg} ${roleConf.color} ${roleConf.border}`}
                      >
                        <RoleIcon size={12} />
                        {roleConf.label}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      {isUpdating ? (
                        <Loader2
                          size={16}
                          className="inline animate-spin text-[#FF6B35]"
                        />
                      ) : isEditing ? (
                        <div className="inline-flex items-center gap-1 bg-[#243447] border border-[#243447] rounded-lg p-1">
                          {(
                            ["customer", "staff", "admin"] as const
                          ).map((role) => {
                            const conf = ROLE_CONFIG[role];
                            const isActive = user.role === role;
                            return (
                              <button
                                key={role}
                                onClick={() =>
                                  !isActive && handleRoleChange(user._id, role)
                                }
                                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  isActive
                                    ? `${conf.bg} ${conf.color} ${conf.border} border`
                                    : "text-gray-400 hover:text-white hover:bg-[#1a2332]"
                                }`}
                              >
                                {conf.label}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1.5 text-gray-500 hover:text-white ml-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingUserId(user._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-[#243447] border border-[#243447] rounded-lg hover:bg-[#1a2332] hover:text-white transition-colors"
                          >
                            <UserCog size={13} />
                            Đổi vai trò
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                            title="Xóa người dùng"
                          >
                            <Trash2 size={13} />
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-sm font-medium animate-in slide-in-from-bottom-2 ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-[#1a2332] w-full max-w-md rounded-2xl border border-[#243447] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center gap-3 p-5 border-b border-[#243447]">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Xác nhận xóa</h3>
                <p className="text-gray-400 text-sm">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-5">
              <p className="text-gray-300 text-sm">
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <span className="text-white font-semibold">{deleteConfirm.fullName}</span>{" "}
                (<span className="text-gray-400">{deleteConfirm.email}</span>) không?
              </p>
              <p className="text-red-400/80 text-xs mt-2">
                ⚠️ Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#243447]">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#243447] rounded-lg hover:bg-[#2d4259] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                disabled={deletingId === deleteConfirm._id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === deleteConfirm._id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Xóa người dùng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
