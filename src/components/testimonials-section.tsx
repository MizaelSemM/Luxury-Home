"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInView } from "./animations/fade-in-view";
import { Star, ChevronLeft, ChevronRight, Loader2, Quote } from "lucide-react";
import type { Testimonial } from "@/types";

async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("/api/testimonials");
  if (!res.ok) throw new Error("Falha ao carregar depoimentos");
  const json = await res.json();
  return json.data;
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: testimonials, isLoading, error } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  const handlePrev = () => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return (
      <section id="testimonials" className="section-padding bg-white">
        <div className="section-container flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-bronze-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="testimonials" className="section-padding bg-white">
        <div className="section-container text-center min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-graphite-500">Não foi possível carregar os depoimentos.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="section-padding bg-white">
      <div className="section-container">
        <FadeInView className="text-center mb-16 md:mb-20">
          <span className="text-bronze-500 text-sm font-medium uppercase tracking-[0.2em]">
            Depoimentos
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-graphite-900 mt-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-graphite-500 text-lg max-w-2xl mx-auto mt-4">
            A satisfação dos nossos clientes é o nosso maior patrimônio.
          </p>
        </FadeInView>

        {(!testimonials || testimonials.length === 0) ? (
          <div className="text-center py-20">
            <p className="text-graphite-400 text-lg">
              Nenhum depoimento cadastrado ainda.
            </p>
          </div>
        ) : testimonials.length === 1 ? (
          <div className="max-w-3xl mx-auto">
            <TestimonialCard testimonial={testimonials[0]} />
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <TestimonialCard testimonial={testimonials[currentIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full border border-graphite-200 text-graphite-600 
                           transition-all duration-300 hover:border-bronze-500 hover:text-bronze-500"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-bronze-500 w-6" : "bg-graphite-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                className="p-3 rounded-full border border-graphite-200 text-graphite-600 
                           transition-all duration-300 hover:border-bronze-500 hover:text-bronze-500"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="text-center">
      <Quote className="w-12 h-12 text-bronze-200 mx-auto mb-6" />
      <p className="text-lg md:text-xl text-graphite-700 leading-relaxed mb-8 italic">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={18}
            className={i < testimonial.rating ? "text-gold-500 fill-gold-500" : "text-graphite-200"}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        {testimonial.avatarUrl && (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.clientName}
            className="w-12 h-12 rounded-full object-cover border-2 border-bronze-200"
          />
        )}
        <div className="text-left">
          <p className="font-semibold text-graphite-900">{testimonial.clientName}</p>
          <p className="text-sm text-graphite-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
