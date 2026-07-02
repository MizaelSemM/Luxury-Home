"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Star } from "lucide-react";
import { useState } from "react";
import { testimonialSchema, type TestimonialInput } from "@/lib/schemas";
import type { Testimonial } from "@/types";

interface TestimonialFormProps {
  onBack: () => void;
  existingTestimonial?: Testimonial | null;
}

export function TestimonialForm({ onBack, existingTestimonial }: TestimonialFormProps) {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const [starRating, setStarRating] = useState(existingTestimonial?.rating || 0);
  const isEditing = !!existingTestimonial;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: existingTestimonial
      ? {
          clientName: existingTestimonial.clientName,
          role: existingTestimonial.role,
          text: existingTestimonial.text,
          rating: existingTestimonial.rating,
          avatarUrl: existingTestimonial.avatarUrl,
        }
      : {
          clientName: "",
          role: "",
          text: "",
          rating: undefined as unknown as number,
          avatarUrl: null,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: TestimonialInput) => {
      const url = isEditing
        ? `/api/testimonials/${existingTestimonial!.id}`
        : "/api/testimonials";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating: starRating }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao salvar depoimento");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      if (!isEditing) {
        reset();
        setStarRating(0);
      }
      setSuccessMsg(
        isEditing
          ? "Depoimento atualizado com sucesso!"
          : "Depoimento cadastrado com sucesso!"
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const onSubmit = (data: TestimonialInput) => {
    if (starRating === 0) {
      alert("Selecione uma nota de 1 a 5 estrelas");
      return;
    }
    mutation.mutate({ ...data, rating: starRating });
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-graphite-500 hover:text-graphite-900 
                   transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Voltar para lista
      </button>

      <div className="bg-white rounded-sm border border-graphite-200 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-graphite-900 mb-6">
          {isEditing ? "Editar Depoimento" : "Novo Depoimento"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Nome do Cliente *
              </label>
              <input
                {...register("clientName")}
                className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                           placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                           transition-colors"
                placeholder="Ex: João Silva"
              />
              {errors.clientName && (
                <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Profissão / Cargo *
              </label>
              <input
                {...register("role")}
                className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                           placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                           transition-colors"
                placeholder="Ex: Empresário"
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              Depoimento *
            </label>
            <textarea
              {...register("text")}
              rows={4}
              className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                         placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                         transition-colors resize-none"
              placeholder="Escreva o depoimento do cliente..."
            />
            {errors.text && (
              <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              Nota (1 a 5) *
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setStarRating(star);
                    setValue("rating", star);
                  }}
                  className="p-1 transition-colors"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= starRating
                        ? "text-gold-500 fill-gold-500"
                        : "text-graphite-200 hover:text-graphite-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              URL do Avatar (opcional)
            </label>
            <input
              {...register("avatarUrl")}
              className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                         placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                         transition-colors"
              placeholder="https://exemplo.com/avatar.jpg"
            />
          </div>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-sm px-4 py-3 text-sm">
              {successMsg}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {mutation.isPending
                ? "Salvando..."
                : isEditing
                ? "Atualizar Depoimento"
                : "Salvar Depoimento"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-graphite-500 hover:text-graphite-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
