import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ToastProvider } from "@/contexts/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastMeal - Hương Vị Khác Biệt",
  description:
    "Gà giòn. Hương vị đậm đà. Giao tận cửa nhà bạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f1419] text-white`}
      >
        <AuthProvider>
          <ToastProvider>
            <ChatProvider>
              <CartProvider>{children}</CartProvider>
            </ChatProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
