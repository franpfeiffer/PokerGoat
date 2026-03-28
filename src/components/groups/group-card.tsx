import { Link } from "@/i18n/navigation";

interface GroupCardProps {
  id: string;
  name: string;
  description: string | null;
  role: "leader" | "temporary_leader" | "member";
  memberCount?: number;
  currency: string;
}

const roleConfig = {
  leader: { label: "Líder", color: "text-gold-400", bg: "bg-gold-500/8 border-gold-500/20" },
  temporary_leader: { label: "Líder temporal", color: "text-gold-400/70", bg: "bg-gold-500/5 border-gold-500/15" },
  member: { label: "Miembro", color: "text-velvet-400", bg: "bg-velvet-800/60 border-velvet-700/40" },
};

export function GroupCard({
  id,
  name,
  description,
  role,
  memberCount,
  currency,
}: GroupCardProps) {
  const cfg = roleConfig[role];
  const isLeader = role === "leader" || role === "temporary_leader";

  return (
    <Link href={`/groups/${id}`} className="focus-ring block rounded-xl group">
      <div className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isLeader
          ? "border-gold-500/15 bg-velvet-900 hover:border-gold-500/30 hover:bg-velvet-800/60"
          : "border-velvet-700/50 bg-velvet-900 hover:border-velvet-600/60 hover:bg-velvet-800/50"
      }`}>
        {/* Top accent line */}
        <div className={`absolute inset-x-0 top-0 h-px ${
          isLeader
            ? "bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"
            : "bg-gradient-to-r from-transparent via-velvet-700/60 to-transparent"
        }`} />

        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-velvet-50 truncate leading-snug">
              {name}
            </h3>
            <span className={`shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {description && (
            <p className="text-xs text-velvet-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-velvet-500">
              {memberCount !== undefined && (
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {memberCount}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {currency}
              </span>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-velvet-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-velvet-400"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
