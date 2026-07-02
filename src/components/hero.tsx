"use client";

import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-graphite-950">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075')] 
                     bg-cover bg-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/70 via-graphite-950/50 to-graphite-950" />
      </div>

      <div className="relative z-10 section-container text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block text-bronze-400 text-sm font-medium uppercase tracking-[0.3em] mb-6">
            Excelência em Construção
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 
                     font-bold text-white leading-tight mb-6"
        >
          Sua Casa dos
          <br />
          <span className="gradient-text">Sonhos</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-graphite-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Projetos personalizados que transformam visões em residências extraordinárias. 
          Cada detalhe pensado para oferecer o melhor em sofisticação e conforto.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="#projects" className="btn-gold">
            Ver Projetos
            <ArrowRight size={16} />
          </a>
          <a href="#contact" className="btn-outline !border-white !text-white hover:!bg-white hover:!text-graphite-900">
            Fale Conosco
          </a>
        </motion.div>
      </div>

      <motion.a
        href="#differencials"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 
                   transition-colors duration-300"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.a>
    </section>
  );
}
