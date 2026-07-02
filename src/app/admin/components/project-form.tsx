"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { projectSchema, type ProjectInput } from "@/lib/schemas";
import type { Project } from "@/types";

interface ProjectFormProps {
  onBack: () => void;
  existingProject?: Project | null;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  squareMeters: number;
  imagesUrlStr: string;
  highlight: boolean;
}

export function ProjectForm({ onBack, existingProject }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState("");
  const isEditing = !!existingProject;

  const defaultValues = useMemo(
    () => ({
      title: existingProject?.title || "",
      description: existingProject?.description || "",
      location: existingProject?.location || "",
      squareMeters: existingProject?.squareMeters || undefined as unknown as number,
      imagesUrlStr: existingProject?.imagesUrl?.join("\n") || "",
      highlight: existingProject?.highlight || false,
    }),
    [existingProject]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: async (form: FormData) => {
      const data: ProjectInput = {
        title: form.title,
        description: form.description,
        location: form.location,
        squareMeters: Number(form.squareMeters),
        imagesUrl: form.imagesUrlStr
          ? form.imagesUrlStr.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        highlight: form.highlight,
      };

      const parsed = projectSchema.parse(data);

      const url = isEditing
        ? `/api/projects/${existingProject!.id}`
        : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao salvar projeto");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (!isEditing) reset({ ...defaultValues, imagesUrlStr: "" });
      setSuccessMsg(
        isEditing
          ? "Projeto atualizado com sucesso!"
          : "Projeto cadastrado com sucesso!"
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
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
          {isEditing ? "Editar Projeto" : "Novo Projeto"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Título do Projeto *
              </label>
              <input
                {...register("title", { required: "O título é obrigatório" })}
                className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                           placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                           transition-colors"
                placeholder="Ex: Residência Villa Verde"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Localização *
              </label>
              <input
                {...register("location", { required: "A localização é obrigatória" })}
                className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                           placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                           transition-colors"
                placeholder="Ex: Alphaville, SP"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              Descrição Completa *
            </label>
            <textarea
              {...register("description", { required: "A descrição é obrigatória" })}
              rows={4}
              className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                         placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                         transition-colors resize-none"
              placeholder="Descreva o projeto em detalhes..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-2">
                Metragem (m²) *
              </label>
              <input
                type="number"
                {...register("squareMeters", {
                  required: "A metragem é obrigatória",
                  valueAsNumber: true,
                  min: { value: 1, message: "Deve ser maior que 0" },
                })}
                className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                           placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                           transition-colors"
                placeholder="Ex: 500"
              />
              {errors.squareMeters && (
                <p className="text-red-500 text-sm mt-1">{errors.squareMeters.message}</p>
              )}
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("highlight")}
                  className="w-4 h-4 rounded border-graphite-300 text-bronze-500 
                             focus:ring-bronze-500"
                />
                <span className="text-sm text-graphite-700">
                  Destacar na página inicial
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-2">
              URLs das Imagens (uma por linha)
            </label>
            <textarea
              {...register("imagesUrlStr")}
              rows={3}
              className="w-full border border-graphite-200 rounded-sm px-4 py-3 text-graphite-900 
                         placeholder:text-graphite-400 focus:outline-none focus:border-bronze-500 
                         transition-colors resize-none"
              placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
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
                ? "Atualizar Projeto"
                : "Salvar Projeto"}
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
