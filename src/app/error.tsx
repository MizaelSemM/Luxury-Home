"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-graphite-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-graphite-900 mb-2">
          Algo deu errado
        </h1>
        <p className="text-graphite-500 mb-8">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
