"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { voteForMvp } from "@/lib/actions/mvp";
import { useToast } from "@/components/ui/toast";
import type { MvpCandidate } from "@/lib/db/queries/mvp";

interface Participant {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

interface MvpVoteProps {
  nightId: string;
  currentUserId: string;
  participants: Participant[];
  candidates: MvpCandidate[];
  currentVote: string | null;
  totalVotes: number;
}

export function MvpVote({
  nightId,
  currentUserId,
  participants,
  candidates,
  currentVote,
  totalVotes,
}: MvpVoteProps) {
  const t = useTranslations("mvp");
  const { toast } = useToast();
  const [selectedVote, setSelectedVote] = useState(currentVote);
  const [isPending, startTransition] = useTransition();

  const votableParticipants = participants.filter(
    (p) => p.userId !== currentUserId
  );

  const handleVote = (candidateId: string) => {
    const prev = selectedVote;
    setSelectedVote(candidateId);
    startTransition(async () => {
      const result = await voteForMvp(nightId, currentUserId, candidateId);
      if (result.error) {
        setSelectedVote(prev);
        toast(typeof result.error === "string" ? result.error : t("voteError"), "error");
      } else {
        toast(t("voteSuccess"), "success");
      }
    });
  };

  const voteMap = new Map(candidates.map((c) => [c.userId, c.votes]));
  const mvp = candidates.length > 0 ? candidates[0] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-velvet-400">
          {t("title")}
        </h3>
        {totalVotes > 0 && (
          <span className="text-[11px] tabular-nums text-velvet-500">
            {totalVotes} {t("votes")}
          </span>
        )}
      </div>

      {mvp && totalVotes >= 2 && (
        <div className="flex items-center gap-2.5 rounded-xl border border-gold-500/20 bg-gold-500/[0.04] px-3.5 py-2.5">
          <Avatar src={mvp.avatarUrl} name={mvp.displayName} size="sm" />
          <span className="flex-1 text-sm font-semibold text-gold-300">
            {mvp.displayName}
          </span>
          <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-bold tabular-nums text-gold-400">
            MVP · {mvp.votes}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {votableParticipants.map((p) => {
          const votes = voteMap.get(p.userId) ?? 0;
          const isSelected = selectedVote === p.userId;
          return (
            <button
              key={p.userId}
              type="button"
              onClick={() => handleVote(p.userId)}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-40 ${
                isSelected
                  ? "border-gold-500/30 bg-gold-500/[0.06] text-gold-300"
                  : "border-velvet-700/40 bg-velvet-800/30 text-velvet-300 active:bg-velvet-800/60"
              }`}
            >
              <Avatar src={p.avatarUrl} name={p.displayName} size="xs" />
              <span className="flex-1 truncate text-xs">{p.displayName}</span>
              {votes > 0 && (
                <span className="text-[11px] font-semibold tabular-nums text-velvet-500">
                  {votes}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!selectedVote && (
        <p className="text-[11px] text-velvet-500">{t("tapToVote")}</p>
      )}
    </div>
  );
}
