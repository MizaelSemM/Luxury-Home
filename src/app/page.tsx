import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Differencials } from "@/components/differencials";
import { ProjectsSection } from "@/components/projects-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Luxury Home | Construtora de Casas de Alto Padrão",
  description:
    "Realizamos o sonho da casa dos seus sonhos. Projetos personalizados, acabamento premium e entrega no prazo.",
  keywords: [
    "construtora",
    "casas de alto padrão",
    "projetos personalizados",
    "luxo",
    "construção civil",
  ],
  openGraph: {
    title: "Luxury Home | Construtora de Casas de Alto Padrão",
    description:
      "Realizamos o sonho da casa dos seus sonhos. Projetos personalizados, acabamento premium e entrega no prazo.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Differencials />
        <ProjectsSection />
        <TestimonialsSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
