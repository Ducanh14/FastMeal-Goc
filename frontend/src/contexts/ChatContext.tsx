"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')) {
    return window.location.origin.replace('-3001', '-3000');
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
const SOCKET_URL = getApiBaseUrl();

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  type: "customer-staff" | "staff-admin";
  initiatorId: string;
  initiatorName: string;
  initiatorRole: string;
  responderId?: string;
  responderName?: string;
  responderRole?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadByInitiator: number;
  unreadByResponder: number;
  status: string;
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Customer bubble chat
  conversationId: string | null;
  messages: ChatMessage[];
  unreadCount: number;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  // Panel (responder) - used in admin chat page
  conversations: Conversation[];
  activeConversation: string | null;
  panelMessages: ChatMessage[];
  loadConversations: (type: "customer-staff" | "staff-admin") => void;
  selectConversation: (conversationId: string) => void;
  sendPanelMessage: (content: string) => void;
  markAsRead: (conversationId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Customer bubble state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Panel state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [panelMessages, setPanelMessages] = useState<ChatMessage[]>([]);

  // Refs for message handler (avoid stale closures)
  const conversationIdRef = useRef<string | null>(null);
  const activeConversationRef = useRef<string | null>(null);
  const isChatOpenRef = useRef(false);

  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);
  useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
  useEffect(() => { isChatOpenRef.current = isChatOpen; }, [isChatOpen]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("register", {
        userId: user.id,
        role: user.role || "customer",
        name: user.name,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Single message handler using refs
    socket.on("message:received", (message: ChatMessage) => {
      // Customer bubble
      if (message.conversationId === conversationIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Panel
      if (message.conversationId === activeConversationRef.current) {
        setPanelMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Unread for customer
      if (
        (user.role === "customer" || !user.role) &&
        message.senderRole !== "customer" &&
        !isChatOpenRef.current
      ) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Customer: open chat
  const openChat = useCallback(() => {
    setIsChatOpen(true);
    setUnreadCount(0);

    if (!user || !socketRef.current) return;

    socketRef.current.emit(
      "customer:startChat",
      { userId: user.id, userName: user.name },
      (response: { conversationId: string; messages: ChatMessage[] }) => {
        setConversationId(response.conversationId);
        setMessages(response.messages);

        if (response.conversationId) {
          socketRef.current?.emit("messages:markRead", {
            conversationId: response.conversationId,
            userId: user.id,
          });
        }
      }
    );
  }, [user]);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  // Customer: send message
  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !conversationId || !user) return;

      socketRef.current.emit(
        "message:send",
        {
          conversationId,
          senderId: user.id,
          senderName: user.name,
          senderRole: "customer",
          content,
        },
        (message: ChatMessage) => {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
      );
    },
    [conversationId, user]
  );

  // Panel: load conversations by type
  const loadConversations = useCallback(
    (type: "customer-staff" | "staff-admin") => {
      if (!socketRef.current) return;

      socketRef.current.emit(
        "getConversations",
        { type },
        (convs: Conversation[]) => {
          setConversations(convs);
        }
      );
    },
    []
  );

  // Panel: select conversation
  const selectConversation = useCallback(
    (convId: string) => {
      if (!socketRef.current || !user) return;

      setActiveConversation(convId);

      socketRef.current.emit(
        "responder:joinConversation",
        {
          conversationId: convId,
          responderId: user.id,
          responderName: user.name,
          responderRole: user.role || "staff",
        },
        (response: { messages: ChatMessage[] }) => {
          setPanelMessages(response.messages);
        }
      );
    },
    [user]
  );

  // Panel: send message
  const sendPanelMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !activeConversation || !user) return;

      socketRef.current.emit(
        "message:send",
        {
          conversationId: activeConversation,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role || "staff",
          content,
        },
        (message: ChatMessage) => {
          setPanelMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
      );
    },
    [activeConversation, user]
  );

  // Mark as read
  const markAsRead = useCallback(
    (convId: string) => {
      if (!socketRef.current || !user) return;
      socketRef.current.emit("messages:markRead", {
        conversationId: convId,
        userId: user.id,
      });
    },
    [user]
  );

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        conversationId,
        messages,
        unreadCount,
        isChatOpen,
        openChat,
        closeChat,
        sendMessage,
        conversations,
        activeConversation,
        panelMessages,
        loadConversations,
        selectConversation,
        sendPanelMessage,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
