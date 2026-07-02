import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers/providers";

export const metadata: Metadata = {
  title: "Luxury Home | Construtora de Casas de Alto Padrão",
  description:
    "Realizamos o sonho da casa dos seus sonhos. Projetos personalizados, acabamento premium e entrega no prazo.",
  keywords: ["construtora", "casas de alto padrão", "projetos personalizados", "luxo"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
