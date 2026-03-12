"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ChatBubble() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    isChatOpen,
    openChat,
    closeChat,
    messages,
    sendMessage,
    unreadCount,
    isConnected,
  } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBubbleClick = () => {
    if (!user) {
      return;
    }
    // Staff/Admin: redirect to admin chat page
    if (user.role === "staff" || user.role === "admin") {
      router.push("/admin/chat");
      return;
    }
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  // Don't render for admin (admin uses admin dashboard)
  if (user?.role === "admin") {
    return null;
  }

  // Staff: only show bubble button that redirects to /admin/chat
  if (user?.role === "staff") {
    return (
      <button
        onClick={handleBubbleClick}
        className="fixed bottom-4 right-4 sm:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-[9999] transition-all duration-300 hover:scale-110 bg-[#FF6B35] hover:bg-[#ff5722]"
        title="Mở trang Chat"
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[340px] sm:w-[380px] h-[480px] bg-[#1a2332] rounded-2xl shadow-2xl border border-[#243447] flex flex-col z-[9999] overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FF6B35] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-white" />
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Hỗ trợ FastMeal
                </h3>
                <p className="text-orange-100 text-xs">
                  {isConnected ? "Đang trực tuyến" : "Đang kết nối..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-[#ff5722] rounded-lg transition-colors"
                title="Thu nhỏ"
              >
                <Minimize2 size={16} className="text-white" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-[#ff5722] rounded-lg transition-colors"
                title="Đóng"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <MessageCircle size={40} className="mb-3 text-gray-500" />
                <p className="font-medium">Xin chào! 👋</p>
                <p className="text-center mt-1 text-xs text-gray-500">
                  Hãy gửi tin nhắn để bắt đầu trò chuyện
                  <br />
                  với nhân viên của chúng tôi.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isOwn = msg.senderRole === "customer";
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      isOwn
                        ? "bg-[#FF6B35] text-white rounded-br-md"
                        : "bg-[#243447] text-gray-100 rounded-bl-md"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-[#FF6B35] font-medium mb-1">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#243447] bg-[#1a2332]">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
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
        </div>
      )}

      {/* Floating Bubble Button */}
      <button
        onClick={handleBubbleClick}
        className={`fixed bottom-4 right-4 sm:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-[9999] transition-all duration-300 hover:scale-110 ${
          isChatOpen
            ? "bg-[#243447] hover:bg-[#1a2332]"
            : "bg-[#FF6B35] hover:bg-[#ff5722]"
        } ${!user ? "opacity-70" : ""}`}
        title={user ? "Chat với nhân viên" : "Đăng nhập để chat"}
      >
        {isChatOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
