"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { voteForMvp } from "@/lib/actions/mvp";
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
  const [selectedVote, setSelectedVote] = useState(currentVote);
  const [isPending, startTransition] = useTransition();

  const votableParticipants = participants.filter(
    (p) => p.userId !== currentUserId
  );

  const handleVote = (candidateId: string) => {
    setSelectedVote(candidateId);
    startTransition(async () => {
      await voteForMvp(nightId, currentUserId, candidateId);
    });
  };

  const voteMap = new Map(candidates.map((c) => [c.userId, c.votes]));
  const mvp = candidates.length > 0 ? candidates[0] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-velvet-200">
          {t("title")}
        </h3>
        {totalVotes > 0 && (
          <span className="text-xs text-velvet-400">
            {totalVotes} {t("votes")}
          </span>
        )}
      </div>

      {mvp && totalVotes >= 2 && (
        <div className="flex items-center gap-2 rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-2">
          <Avatar src={mvp.avatarUrl} name={mvp.displayName} size="sm" />
          <span className="flex-1 text-sm font-medium text-gold-300">
            {mvp.displayName}
          </span>
          <span className="text-xs font-bold text-gold-400">
            MVP ({mvp.votes} {t("votes")})
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {votableParticipants.map((p) => {
          const votes = voteMap.get(p.userId) ?? 0;
          const isSelected = selectedVote === p.userId;
          return (
            <button
              key={p.userId}
              onClick={() => handleVote(p.userId)}
              disabled={isPending}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                isSelected
                  ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
                  : "border-velvet-700 bg-velvet-800/50 text-velvet-200 hover:border-velvet-600"
              }`}
            >
              <Avatar src={p.avatarUrl} name={p.displayName} size="xs" />
              <span className="flex-1 truncate">{p.displayName}</span>
              {votes > 0 && (
                <span className="text-xs tabular-nums text-velvet-400">
                  {votes}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!selectedVote && (
        <p className="text-xs text-velvet-400">{t("tapToVote")}</p>
      )}
    </div>
  );
}
