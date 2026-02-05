"use client";

import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="w-full py-4 mt-auto border-t bg-[#ce0707]">
      <div className="container max-w-lg mx-auto flex flex-col items-center justify-center gap-4 px-4">
        <div className="relative w-12 h-12">
          <Image
            src="/images/logo-co.png"
            alt="Logo CO"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-xs text-white text-center">
          Desenvolvido por CO &copy; 2026 | Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
