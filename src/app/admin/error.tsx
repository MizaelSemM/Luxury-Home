"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <span className="text-red-500 text-2xl font-bold">!</span>
      </div>
      <h2 className="text-xl font-semibold text-graphite-900 mb-2">
        Erro no painel
      </h2>
      <p className="text-graphite-500 mb-6">
        {error.message || "Ocorreu um erro inesperado."}
      </p>
      <button onClick={reset} className="btn-primary">
        Tentar novamente
      </button>
    </div>
  );
}
