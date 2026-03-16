export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-velvet-700 border-t-gold-500" />
        <span className="text-sm text-velvet-400">Cargando\u2026</span>
      </div>
    </div>
  );
}
