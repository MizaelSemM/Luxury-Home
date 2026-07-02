"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProjectModal } from "./project-modal";
import { FadeInView } from "./animations/fade-in-view";
import { MapPin, Ruler, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Project } from "@/types";

interface ProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchProjects(page: number): Promise<ProjectsResponse> {
  const res = await fetch(`/api/projects?page=${page}&limit=6`);
  if (!res.ok) throw new Error("Falha ao carregar projetos");
  return res.json();
}

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", page],
    queryFn: () => fetchProjects(page),
    staleTime: 1000 * 60 * 5,
  });

  const projects = data?.data;
  const pagination = data?.pagination;

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  if (isLoading) {
    return (
      <section id="projects" className="section-padding bg-graphite-50">
        <div className="section-container flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-bronze-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="section-padding bg-graphite-50">
        <div className="section-container text-center min-h-[400px] flex flex-col items-center justify-center">
          <p className="text-graphite-500">Não foi possível carregar os projetos.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding bg-graphite-50">
      <div className="section-container">
        <FadeInView className="text-center mb-16 md:mb-20">
          <span className="text-bronze-500 text-sm font-medium uppercase tracking-[0.2em]">
            Portfólio
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-graphite-900 mt-4">
            Nossos Projetos
          </h2>
          <p className="text-graphite-500 text-lg max-w-2xl mx-auto mt-4">
            Conheça algumas das residências que projetamos e construímos com
            dedicação e excelência.
          </p>
        </FadeInView>

        {(!projects || projects.length === 0) ? (
          <div className="text-center py-20">
            <p className="text-graphite-400 text-lg">
              Nenhum projeto cadastrado ainda.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((project, index) => (
                <FadeInView key={project.id} delay={index * 0.1}>
                  <button
                    onClick={() => openModal(project)}
                    className="group text-left w-full"
                  >
                    <div className="relative overflow-hidden rounded-sm bg-graphite-100 mb-4 aspect-[4/3]">
                      <img
                        src={project.imagesUrl[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"}
                        alt={project.title}
                        className="w-full h-full object-cover transition-all duration-700 
                                   group-hover:scale-110 group-hover:rotate-[0.5deg]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-graphite-900/60 via-transparent to-transparent 
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 
                                       opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <span className="text-white text-sm font-medium">Ver detalhes →</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-graphite-900 group-hover:text-bronze-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-graphite-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Ruler size={14} />
                        {project.squareMeters} m²
                      </span>
                    </div>
                  </button>
                </FadeInView>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-3 rounded-full border border-graphite-200 text-graphite-600 
                             transition-all duration-300 hover:border-bronze-500 hover:text-bronze-500
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-sm text-sm font-medium transition-all duration-300 ${
                          pageNum === page
                            ? "bg-bronze-500 text-white"
                            : "text-graphite-600 hover:bg-graphite-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() =>
                    setPage((p) =>
                      pagination ? Math.min(pagination.totalPages, p + 1) : p + 1
                    )
                  }
                  disabled={!pagination || page >= pagination.totalPages}
                  className="p-3 rounded-full border border-graphite-200 text-graphite-600 
                             transition-all duration-300 hover:border-bronze-500 hover:text-bronze-500
                             disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
}
