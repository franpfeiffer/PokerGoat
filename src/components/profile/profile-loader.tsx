"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { ProfileContent } from "./profile-content";
import { getFullProfile } from "@/lib/actions/profile";
import { Card, CardContent } from "@/components/ui/card";
import type { GroupComparisonStats } from "@/lib/db/queries/users";
import type { AchievementInput } from "@/lib/achievements";

type PersonalRecords = {
  biggestWin: number;
  worstNight: number;
  biggestWinNightId: string | null;
  worstNightId: string | null;
  biggestWinDate: string | null;
  worstNightDate: string | null;
  longestWinStreak: number;
  groupId?: string;
};

type ProfileState = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  bankAlias: string | null;
};

export function ProfileLoader() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const locale = useLocale();

  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [stats, setStats] = useState({ nightsPlayed: 0, totalProfit: 0, winRate: 0 });
  const [profitHistory, setProfitHistory] = useState<{ date: string; profitLoss: number; cumulative: number }[]>([]);
  const [streak, setStreak] = useState<{ type: "winning" | "losing" | "none"; count: number }>({ type: "none", count: 0 });
  const [groupComparison, setGroupComparison] = useState<GroupComparisonStats | null>(null);
  const [achievementData, setAchievementData] = useState<AchievementInput | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionPending || !session?.user) return;

    let cancelled = false;

    async function load(attempt = 0) {
      try {
        const data = await getFullProfile(
          session!.user.id,
          session!.user.name || session!.user.email.split("@")[0],
          session!.user.image ?? undefined,
        );
        if (cancelled) return;
        const p = data.profile;
        setProfile({ id: p.id, displayName: p.displayName, avatarUrl: p.avatarUrl ?? null, bankAlias: p.bankAlias ?? null });
        setStats(data.stats);
        setProfitHistory(data.profitHistory);
        setStreak(data.streak);
        setGroupComparison(data.groupComparison);
        setAchievementData({ ...data.achievementData, streak: data.streak });
        setPersonalRecords({
          ...data.personalRecords,
          groupId: data.groupComparison?.groupId ?? undefined,
        });
        setLoading(false);
      } catch {
        if (cancelled) return;
        if (attempt < 3) {
          const delay = [2000, 4000, 8000][attempt];
          retryRef.current = setTimeout(() => load(attempt + 1), delay);
        } else {
          setLoading(false);
          setFailed(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [sessionPending, session]);

  if (failed) {
    return <ProfileError />;
  }

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
      bankAlias={profile.bankAlias}
      stats={stats}
      profitHistory={profitHistory}
      streak={streak}
      groupComparison={groupComparison}
      achievementData={achievementData}
      personalRecords={personalRecords}
      locale={locale}
      onProfileChange={(patch) => setProfile((p) => p ? { ...p, ...patch } : p)}
    />
  );
}

function ProfileError() {
  return (
    <Card className="mt-4">
      <CardContent className="flex flex-col items-center gap-4 py-12 px-6 text-center">
        <p className="text-base font-semibold text-velvet-100">
          No se pudo cargar el perfil
        </p>
        <p className="text-sm text-velvet-400">
          Hubo un problema al conectar con la base de datos. Revisá tu conexión e intentá de nuevo.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-velvet-700 px-5 py-2 text-sm font-medium text-velvet-100 transition-colors hover:bg-velvet-600 active:scale-95"
        >
          Reintentar
        </button>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3">
      <Card className="relative overflow-hidden">
        <CardContent className="flex flex-col items-center py-8 px-4 sm:py-10 sm:px-6">
          <div className="h-24 w-24 rounded-full bg-velvet-800 animate-pulse" />
          <div className="mt-5 h-7 w-36 rounded-lg bg-velvet-800 animate-pulse" />
          <div className="mt-2 h-4 w-48 rounded bg-velvet-800/60 animate-pulse" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-5 px-3 text-center sm:py-6">
          <div className="h-10 w-32 rounded-lg bg-velvet-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-velvet-800/60 animate-pulse" />
        </CardContent>
      </Card>
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
      <Card>
        <CardContent className="py-5 px-3 sm:py-6">
          <div className="h-4 w-36 rounded bg-velvet-800/60 animate-pulse mb-4" />
          <div className="h-40 w-full rounded-lg bg-velvet-800/40 animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
