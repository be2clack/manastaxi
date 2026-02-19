"use client";

import { FaWhatsapp } from "react-icons/fa6";

export function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+996XXXXXXXXX";

  return (
    <a
      href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#1da851] active:scale-95"
      aria-label="WhatsApp"
    >
      <FaWhatsapp className="h-7 w-7" />
    </a>
  );
}
