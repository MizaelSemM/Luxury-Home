"use client";

import { FadeInView } from "./animations/fade-in-view";
import { Home, Ruler, ShieldCheck } from "lucide-react";

const DIFFERENCIALS = [
  {
    icon: Ruler,
    title: "Projeto 3D Personalizado",
    description:
      "Criamos maquetes eletrônicas realistas para que você visualize cada ambiente antes da construção, com liberdade total para personalizar.",
  },
  {
    icon: Home,
    title: "Acabamento Premium",
    description:
      "Materiais selecionados das melhores marcas nacionais e importadas. Acabamento impecável que garante durabilidade e sofisticação.",
  },
  {
    icon: ShieldCheck,
    title: "Entrega Garantida",
    description:
      "Cronograma transparente e gestão de obra eficiente. Sua casa entregue no prazo, sem surpresas e com total suporte pós-obra.",
  },
];

export function Differencials() {
  return (
    <section id="differencials" className="section-padding bg-off-white">
      <div className="section-container">
        <FadeInView className="text-center mb-16 md:mb-20">
          <span className="text-bronze-500 text-sm font-medium uppercase tracking-[0.2em]">
            Nossos Diferenciais
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-graphite-900 mt-4">
            Por que nos escolher?
          </h2>
          <p className="text-graphite-500 text-lg max-w-2xl mx-auto mt-4">
            Um processo transparente e focado em excelência desde o primeiro esboço 
            até a entrega das chaves.
          </p>
        </FadeInView>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {DIFFERENCIALS.map((item, index) => (
            <FadeInView key={item.title} delay={index * 0.15}>
              <div className="group relative bg-white p-8 md:p-10 rounded-sm border border-graphite-100 
                              transition-all duration-500 hover:border-bronze-300 hover:shadow-2xl hover:shadow-bronze-500/5">
                <div className="w-14 h-14 rounded-sm bg-bronze-50 flex items-center justify-center mb-6 
                                transition-colors duration-500 group-hover:bg-bronze-100">
                  <item.icon className="w-6 h-6 text-bronze-500" />
                </div>
                <h3 className="text-xl font-semibold text-graphite-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-graphite-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </FadeInView>
          ))}
        </div>
      </div>
    </section>
  );
}
