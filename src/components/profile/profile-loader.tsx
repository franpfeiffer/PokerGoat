"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { ProfileContent } from "./profile-content";
import { getOrCreateProfile, getProfileStats, getProfileProfitHistory, getProfileStreak, getProfileGroupComparison } from "@/lib/actions/profile";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileLoader() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const locale = useLocale();
  const [profile, setProfile] = useState<{
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null>(null);
  const [stats, setStats] = useState({ nightsPlayed: 0, totalProfit: 0, winRate: 0 });
  const [profitHistory, setProfitHistory] = useState<{ date: string; profitLoss: number; cumulative: number }[]>([]);
  const [streak, setStreak] = useState<{ type: "winning" | "losing" | "none"; count: number }>({ type: "none", count: 0 });
  const [groupComparison, setGroupComparison] = useState<Awaited<ReturnType<typeof getProfileGroupComparison>>>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (sessionPending || !session?.user) return;

    async function load() {
      const { profile: p } = await getOrCreateProfile({
        authUserId: session!.user.id,
        displayName: session!.user.name || session!.user.email.split("@")[0],
        avatarUrl: session!.user.image ?? undefined,
      });
      if (p) {
        setProfile(p);
        const [s, history, str, comparison] = await Promise.all([
          getProfileStats(p.id),
          getProfileProfitHistory(p.id),
          getProfileStreak(p.id),
          getProfileGroupComparison(p.id),
        ]);
        setStats(s);
        setProfitHistory(history);
        setStreak(str);
        setGroupComparison(comparison);
      }
      setLoading(false);
    }

    load();
  }, [sessionPending, session, reloadKey]);

  if (loading || !profile || !session) {
    return <ProfileSkeleton />;
  }

  return (
    <ProfileContent
      userId={profile.id}
      displayName={profile.displayName}
      email={session.user.email}
      avatarUrl={profile.avatarUrl}
      googleImage={session.user.image}
      stats={stats}
      profitHistory={profitHistory}
      streak={streak}
      groupComparison={groupComparison}
      locale={locale}
      onUpdate={reload}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      {/* Hero card */}
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 px-4 sm:py-10 sm:px-6">
          <div className="h-24 w-24 rounded-full bg-velvet-800 animate-pulse" />
          <div className="mt-5 h-7 w-36 rounded-lg bg-velvet-800 animate-pulse" />
          <div className="mt-2 h-4 w-48 rounded bg-velvet-800/60 animate-pulse" />
        </CardContent>
      </Card>
      {/* Net worth card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center sm:py-6">
          <div className="h-10 w-32 rounded-lg bg-velvet-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-velvet-800/60 animate-pulse" />
        </CardContent>
      </Card>
      {/* Nights + Winrate */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center sm:py-6">
              <div className="h-8 w-16 rounded-lg bg-velvet-800 animate-pulse" />
              <div className="h-3 w-20 rounded bg-velvet-800/60 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Chart placeholder */}
      <Card>
        <CardContent className="py-5 px-3 sm:py-6">
          <div className="h-4 w-36 rounded bg-velvet-800/60 animate-pulse mb-4" />
          <div className="h-40 w-full rounded-lg bg-velvet-800/40 animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
