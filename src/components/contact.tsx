"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FadeInView } from "./animations/fade-in-view";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/schemas";

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Telefone",
    value: "(11) 99999-8888",
    href: "tel:+5511999998888",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "contato@luxuryhome.com.br",
    href: "mailto:contato@luxuryhome.com.br",
  },
  {
    icon: MapPin,
    label: "Endereço",
    value: "Av. Oscar Niemeyer, 2000 - São Paulo, SP",
  },
  {
    icon: Clock,
    label: "Atendimento",
    value: "Seg a Sex - 9h às 18h",
  },
];

export function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactInput) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao enviar mensagem");
      }
      return res.json();
    },
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = (data: ContactInput) => {
    mutation.mutate(data);
  };

  return (
    <section id="contact" className="section-padding bg-graphite-950 text-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <FadeInView direction="left">
            <span className="text-bronze-400 text-sm font-medium uppercase tracking-[0.2em]">
              Contato
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">
              Vamos construir <br />
              <span className="gradient-text">algo grandioso</span> juntos
            </h2>
            <p className="text-graphite-400 text-lg leading-relaxed mb-10">
              Entre em contato conosco para agendar uma reunião e dar o primeiro
              passo rumo à casa dos seus sonhos.
            </p>

            <div className="space-y-6">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-sm bg-bronze-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-bronze-400" />
                  </div>
                  <div>
                    <p className="text-sm text-bronze-400 font-medium uppercase tracking-wider">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-white hover:text-bronze-300 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FadeInView>

          <FadeInView direction="right" delay={0.2}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-8 md:p-10"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-graphite-300 mb-2">
                    Nome completo *
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 
                               text-white placeholder:text-graphite-500 focus:outline-none focus:border-bronze-500 
                               transition-colors"
                    placeholder="Seu nome"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite-300 mb-2">
                    E-mail *
                  </label>
                  <input
                    {...register("email")}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 
                               text-white placeholder:text-graphite-500 focus:outline-none focus:border-bronze-500 
                               transition-colors"
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-graphite-300 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 
                               text-white placeholder:text-graphite-500 focus:outline-none focus:border-bronze-500 
                               transition-colors resize-none"
                    placeholder="Conte-nos sobre seu projeto..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {mutation.isSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-sm px-4 py-3 text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </div>
                )}

                {mutation.isError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm px-4 py-3 text-sm">
                    Erro ao enviar mensagem. Tente novamente.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Enviar Mensagem
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
