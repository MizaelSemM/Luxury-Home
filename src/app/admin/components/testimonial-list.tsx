"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Star, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Testimonial } from "@/types";

interface TestimonialListProps {
  onCreate: () => void;
  onEdit: (testimonial: Testimonial) => void;
}

export function TestimonialList({ onCreate, onEdit }: TestimonialListProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["testimonials", "admin", page],
    queryFn: async () => {
      const res = await fetch(`/api/testimonials?page=${page}&limit=20`);
      if (!res.ok) throw new Error("Falha ao carregar depoimentos");
      return res.json();
    },
  });

  const testimonials: Testimonial[] = data?.data;
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao excluir");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este depoimento?")) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-graphite-900">
          Depoimentos Cadastrados
          {pagination && (
            <span className="text-sm font-normal text-graphite-400 ml-2">
              ({pagination.total})
            </span>
          )}
        </h2>
        <button onClick={onCreate} className="btn-primary text-xs !py-2.5 !px-5">
          <Plus size={16} />
          Novo Depoimento
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-bronze-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-sm p-4 text-sm">
          Erro ao carregar depoimentos.
        </div>
      )}

      {testimonials && testimonials.length === 0 && (
        <div className="text-center py-20 bg-white border border-graphite-200 rounded-sm">
          <p className="text-graphite-400 mb-4">Nenhum depoimento cadastrado.</p>
          <button onClick={onCreate} className="btn-primary text-xs !py-2.5 !px-5">
            <Plus size={16} />
            Criar Primeiro Depoimento
          </button>
        </div>
      )}

      {testimonials && testimonials.length > 0 && (
        <>
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white border border-graphite-200 rounded-sm p-5 flex items-start gap-4 
                           hover:border-bronze-300 transition-colors"
              >
                {testimonial.avatarUrl && (
                  <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.clientName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-bronze-200 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-graphite-900">
                        {testimonial.clientName}
                      </h3>
                      <p className="text-sm text-graphite-500">{testimonial.role}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < testimonial.rating
                              ? "text-gold-500 fill-gold-500"
                              : "text-graphite-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-graphite-600 mt-2 line-clamp-3 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-graphite-400">
                      Criado em {new Date(testimonial.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(testimonial)}
                        className="p-1.5 text-graphite-400 hover:text-bronze-500 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        disabled={deletingId === testimonial.id}
                        className="p-1.5 text-graphite-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === testimonial.id ? (
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
