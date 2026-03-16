"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-4xl font-bold text-loss">Error</h1>
      <p className="text-lg text-velvet-300">Algo sali\u00f3 mal.</p>
      <button
        type="button"
        onClick={reset}
        className="focus-ring bg-gold-500 hover:bg-gold-400 inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold text-velvet-950 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
}
