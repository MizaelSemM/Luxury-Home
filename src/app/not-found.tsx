import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-graphite-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-display font-bold gradient-text mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-graphite-900 mb-2">
          Página não encontrada
        </h2>
        <p className="text-graphite-500 mb-8">
          A página que você procura não existe ou foi removida.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
