"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MapPin,
  Ruler,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Project } from "@/types";

interface ProjectListProps {
  onCreate: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectList({ onCreate, onEdit }: ProjectListProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", "admin", page],
    queryFn: async () => {
      const res = await fetch(`/api/projects?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Falha ao carregar projetos");
      return res.json();
    },
  });

  const projects: Project[] = data?.data;
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-graphite-900">
          Projetos Cadastrados
          {pagination && (
            <span className="text-sm font-normal text-graphite-400 ml-2">
              ({pagination.total})
            </span>
          )}
        </h2>
        <button onClick={onCreate} className="btn-primary text-xs !py-2.5 !px-5">
          <Plus size={16} />
          Novo Projeto
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-bronze-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-sm p-4 text-sm">
          Erro ao carregar projetos.
        </div>
      )}

      {projects && projects.length === 0 && (
        <div className="text-center py-20 bg-white border border-graphite-200 rounded-sm">
          <p className="text-graphite-400 mb-4">Nenhum projeto cadastrado.</p>
          <button onClick={onCreate} className="btn-primary text-xs !py-2.5 !px-5">
            <Plus size={16} />
            Criar Primeiro Projeto
          </button>
        </div>
      )}

      {projects && projects.length > 0 && (
        <>
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-graphite-200 rounded-sm p-5 flex flex-col sm:flex-row 
                           items-start gap-4 hover:border-bronze-300 transition-colors"
              >
                <div className="w-full sm:w-24 h-20 rounded-sm overflow-hidden bg-graphite-100 flex-shrink-0">
                  <img
                    src={project.imagesUrl[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075"}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-graphite-900">{project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-graphite-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Ruler size={14} />
                          {project.squareMeters} m²
                        </span>
                      </div>
                    </div>
                    {project.highlight && (
                      <span className="text-xs bg-bronze-100 text-bronze-700 px-2 py-1 rounded-sm font-medium">
                        Destaque
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-graphite-500 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-graphite-400">
                      Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(project)}
                        className="p-1.5 text-graphite-400 hover:text-bronze-500 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingId === project.id}
                        className="p-1.5 text-graphite-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === project.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-sm text-sm font-medium transition-all ${
                      pageNum === page
                        ? "bg-graphite-900 text-white"
                        : "text-graphite-600 hover:bg-graphite-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
