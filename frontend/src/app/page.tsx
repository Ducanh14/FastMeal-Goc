"use client";

import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
import LocationSearch from "@/components/home/LocationSearch";
import MenuSection from "@/components/home/MenuSection";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/CartSidebar";
import AuthModal from "@/components/AuthModal";
import OrderHistory from "@/components/OrderHistory";
import ChatBubble from "@/components/ChatBubble";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-12 sm:pt-14">
        <HeroSection />
        <LocationSearch />
        <MenuSection />
      </main>
      <Footer />
      <CartSidebar />
      <AuthModal />
      <OrderHistory />
      <ChatBubble />
    </>
  );
}
