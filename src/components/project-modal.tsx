"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MapPin, Ruler, ArrowRight } from "lucide-react";
import type { Project } from "@/types";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!project) return null;

  const images = project.imagesUrl.length > 0
    ? project.imagesUrl
    : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-sm shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full 
                         shadow-lg transition-colors hover:bg-white"
            >
              <X size={20} />
            </button>

            <div className="relative h-[300px] md:h-[400px] overflow-hidden bg-graphite-100">
              <img
                src={images[currentImage]}
                alt={project.title}
                className="w-full h-full object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm 
                               rounded-full shadow-lg transition-colors hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm 
                               rounded-full shadow-lg transition-colors hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImage(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentImage ? "bg-white w-6" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 md:p-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-graphite-900 mb-4">
                {project.title}
              </h2>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-graphite-500">
                  <MapPin size={16} className="text-bronze-500" />
                  <span className="text-sm">{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-graphite-500">
                  <Ruler size={16} className="text-bronze-500" />
                  <span className="text-sm">{project.squareMeters} m²</span>
                </div>
              </div>

              <p className="text-graphite-600 leading-relaxed mb-8">
                {project.description}
              </p>

              <a
                href="#contact"
                onClick={onClose}
                className="btn-primary inline-flex"
              >
                Solicitar projeto parecido
                <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
