interface LegendPanelProps {
  labels: {
    title: string;
    raise: string;
    call: string;
    marginal: string;
    fold: string;
  };
}

const items = [
  { key: "raise", dotClass: "bg-gold-500 text-velvet-950" },
  { key: "call", dotClass: "bg-profit text-velvet-950" },
  { key: "marginal", dotClass: "bg-gold-300 text-velvet-950" },
  { key: "fold", dotClass: "bg-velvet-800 text-velvet-100 border border-velvet-700/60" },
] as const;

export function LegendPanel({ labels }: LegendPanelProps) {
  return (
    <section className="rounded-xl border border-velvet-700/60 bg-velvet-900 p-3 sm:p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-velvet-200">
        {labels.title}
      </h2>
      <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-velvet-200">
            <span className={`h-4 w-4 rounded-sm ${item.dotClass}`} />
            <span>{labels[item.key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
