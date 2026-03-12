"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Users,
  Clock,
  Circle,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useChat, Conversation, ChatMessage } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminChatPage() {
  const { user } = useAuth();
  const {
    socket,
    conversations,
    activeConversation,
    panelMessages,
    loadConversations,
    selectConversation,
    sendPanelMessage,
    markAsRead,
    isConnected,
  } = useChat();

  const userRole = user?.role || "staff";

  const [activeTab, setActiveTab] = useState<string>(
    userRole === "admin" ? "staff-admin" : "customer-staff"
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Staff → Admin direct chat state
  const [adminChatConvId, setAdminChatConvId] = useState<string | null>(null);
  const [adminChatMessages, setAdminChatMessages] = useState<ChatMessage[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);
  const adminInputRef = useRef<HTMLInputElement>(null);

  // Load conversations when tab changes
  useEffect(() => {
    if (activeTab === "admin-direct") return;
    loadConversations(activeTab as "customer-staff" | "staff-admin");
  }, [activeTab, loadConversations]);

  // Auto-refresh on conversations:updated
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      if (activeTab !== "admin-direct") {
        loadConversations(activeTab as "customer-staff" | "staff-admin");
      }
    };
    socket.on("conversations:updated", handler);
    return () => {
      socket.off("conversations:updated", handler);
    };
  }, [socket, activeTab, loadConversations]);

  // Staff admin direct chat setup
  useEffect(() => {
    if (activeTab !== "admin-direct" || !socket || !user || userRole !== "staff")
      return;

    socket.emit(
      "staff:startAdminChat",
      { userId: user.id, userName: user.name },
      (response: { conversationId: string; messages: ChatMessage[] }) => {
        setAdminChatConvId(response.conversationId);
        setAdminChatMessages(response.messages);
        if (response.conversationId) {
          socket.emit("messages:markRead", {
            conversationId: response.conversationId,
            userId: user.id,
          });
        }
      }
    );
  }, [activeTab, socket, user, userRole]);

  // Listen for admin direct chat messages
  useEffect(() => {
    if (!socket || !adminChatConvId) return;
    const handler = (message: ChatMessage) => {
      if (message.conversationId === adminChatConvId) {
        setAdminChatMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };
    socket.on("message:received", handler);
    return () => {
      socket.off("message:received", handler);
    };
  }, [socket, adminChatConvId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [panelMessages]);

  useEffect(() => {
    adminMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [adminChatMessages]);

  // Focus input
  useEffect(() => {
    if (activeConversation) setTimeout(() => inputRef.current?.focus(), 100);
  }, [activeConversation]);

  useEffect(() => {
    if (activeTab === "admin-direct")
      setTimeout(() => adminInputRef.current?.focus(), 100);
  }, [activeTab]);

  // Panel handlers
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendPanelMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    selectConversation(conv._id);
    markAsRead(conv._id);
  };

  // Admin direct chat handlers
  const handleAdminChatSend = () => {
    const trimmed = adminChatInput.trim();
    if (!trimmed || !socket || !adminChatConvId || !user) return;
    socket.emit(
      "message:send",
      {
        conversationId: adminChatConvId,
        senderId: user.id,
        senderName: user.name,
        senderRole: "staff",
        content: trimmed,
      },
      (message: ChatMessage) => {
        setAdminChatMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    );
    setAdminChatInput("");
  };

  const handleAdminChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdminChatSend();
    }
  };

  // Helpers
  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (conv: Conversation) =>
    conv.type === "customer-staff" ? "Khách hàng" : "Nhân viên";

  const tabs =
    userRole === "admin"
      ? [{ key: "staff-admin", label: "Nhân viên", icon: Shield }]
      : [
          { key: "customer-staff", label: "Khách hàng", icon: Users },
          { key: "admin-direct", label: "Liên hệ Admin", icon: ShieldCheck },
        ];

  const selectedConv = conversations.find(
    (c) => c._id === activeConversation
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="text-[#FF6B35]" size={28} />
          Quản lý Chat
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {userRole === "admin"
            ? "Trả lời tin nhắn từ nhân viên"
            : "Trả lời khách hàng và liên hệ admin"}
          <span className="ml-2">
            {isConnected ? (
              <span className="text-green-400">● Đang kết nối</span>
            ) : (
              <span className="text-red-400">● Mất kết nối</span>
            )}
          </span>
        </p>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-1 mb-4 bg-[#1a2332] border border-[#243447] rounded-xl p-1 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setInput("");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#FF6B35] text-white"
                    : "text-gray-400 hover:text-white hover:bg-[#243447]"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "admin-direct" ? (
          /* ========= Staff → Admin Direct Chat ========= */
          <div className="h-full bg-[#1a2332] rounded-xl border border-[#243447] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#243447] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Admin</h3>
                <p className="text-xs text-gray-400">
                  Gửi tin nhắn cho quản trị viên
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {adminChatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
                  <ShieldCheck size={40} className="mb-3" />
                  <p className="font-medium">Liên hệ Admin</p>
                  <p className="text-xs text-center mt-1">
                    Gửi tin nhắn để liên hệ với quản trị viên
                  </p>
                </div>
              )}
              {adminChatMessages.map((msg) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] px-3 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? "bg-[#FF6B35] text-white rounded-br-md"
                          : "bg-[#243447] text-gray-100 rounded-bl-md"
                      }`}
                    >
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.senderName}
                      </p>
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? "text-orange-200" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={adminMessagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#243447]">
              <div className="flex items-center gap-2">
                <input
                  ref={adminInputRef}
                  type="text"
                  value={adminChatInput}
                  onChange={(e) => setAdminChatInput(e.target.value)}
                  onKeyDown={handleAdminChatKeyDown}
                  placeholder="Nhập tin nhắn cho admin..."
                  className="flex-1 bg-[#243447] text-white text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-500"
                />
                <button
                  onClick={handleAdminChatSend}
                  disabled={!adminChatInput.trim()}
                  className="p-2.5 bg-[#FF6B35] rounded-full hover:bg-[#ff5722] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========= Conversation List + Chat Panel ========= */
          <div className="flex gap-4 h-full">
            {/* Conversations List */}
            <div className="w-80 bg-[#1a2332] rounded-xl border border-[#243447] flex flex-col overflow-hidden shrink-0">
              <div className="px-4 py-3 border-b border-[#243447] flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-300">
                  Cuộc trò chuyện ({conversations.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm p-4">
                    <MessageCircle size={32} className="mb-2" />
                    <p>Chưa có cuộc trò chuyện nào</p>
                  </div>
                )}

                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-[#243447]/50 hover:bg-[#243447]/30 transition-colors ${
                      activeConversation === conv._id
                        ? "bg-[#243447] border-l-2 border-l-[#FF6B35]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] text-sm font-bold">
                          {conv.initiatorName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white truncate block max-w-[120px]">
                            {conv.initiatorName}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {getRoleLabel(conv)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.unreadByResponder > 0 && (
                          <span className="w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            {conv.unreadByResponder}
                          </span>
                        )}
                        <Circle
                          size={8}
                          className={
                            conv.status === "open"
                              ? "text-green-400 fill-green-400"
                              : "text-gray-500 fill-gray-500"
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 truncate pl-10">
                      {conv.lastMessage || "Chưa có tin nhắn"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 pl-10 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(conv.lastMessageAt)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#1a2332] rounded-xl border border-[#243447] flex flex-col overflow-hidden">
              {!activeConversation ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle size={48} className="mb-3" />
                  <p className="text-lg font-medium">
                    Chọn một cuộc trò chuyện
                  </p>
                  <p className="text-sm mt-1">để bắt đầu trả lời</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-[#243447] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35] font-bold">
                      {selectedConv?.initiatorName?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {selectedConv?.initiatorName || "Người dùng"}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {selectedConv ? getRoleLabel(selectedConv) : ""}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {panelMessages.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Chưa có tin nhắn trong cuộc trò chuyện này
                      </div>
                    )}

                    {panelMessages.map((msg: ChatMessage) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[65%] px-3 py-2 rounded-2xl text-sm ${
                              isOwn
                                ? "bg-[#FF6B35] text-white rounded-br-md"
                                : "bg-[#243447] text-gray-100 rounded-bl-md"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {msg.senderName}
                            </p>
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwn ? "text-orange-200" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-[#243447]">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập câu trả lời..."
                        className="flex-1 bg-[#243447] text-white text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-500"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2.5 bg-[#FF6B35] rounded-full hover:bg-[#ff5722] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
