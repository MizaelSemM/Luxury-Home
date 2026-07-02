"use client";

import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-graphite-950 border-t border-white/5">
      <div className="section-container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-2xl font-display font-bold text-white">
              Luxury<span className="gradient-text">Home</span>
            </span>
            <p className="text-graphite-500 text-sm mt-2">
              © {new Date().getFullYear()} Luxury Home. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#projects" className="text-sm text-graphite-400 hover:text-bronze-400 transition-colors">
              Projetos
            </a>
            <a href="#differencials" className="text-sm text-graphite-400 hover:text-bronze-400 transition-colors">
              Diferenciais
            </a>
            <a href="#testimonials" className="text-sm text-graphite-400 hover:text-bronze-400 transition-colors">
              Depoimentos
            </a>
            <button
              onClick={scrollToTop}
              className="p-3 rounded-full border border-white/10 text-bronze-400 
                         hover:border-bronze-500 hover:text-bronze-300 transition-all duration-300"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
