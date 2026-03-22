"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { ProfileContent } from "./profile-content";
import { getOrCreateProfile, getProfileStats } from "@/lib/actions/profile";
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
        const s = await getProfileStats(p.id);
        setStats(s);
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
      locale={locale}
      onUpdate={reload}
    />
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden profile-hero-bg">
        <CardContent className="flex flex-col items-center py-10 px-6">
          {/* Avatar skeleton */}
          <div className="h-28 w-28 rounded-full bg-velvet-800 animate-pulse" />
          {/* Name skeleton */}
          <div className="mt-5 h-7 w-40 rounded-lg bg-velvet-800 animate-pulse" />
          {/* Email skeleton */}
          <div className="mt-2 h-4 w-52 rounded bg-velvet-800/60 animate-pulse" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center gap-3 py-6 px-4">
              <div className="h-5 w-5 rounded bg-velvet-800/60 animate-pulse" />
              <div className="h-9 w-20 rounded-lg bg-velvet-800 animate-pulse" />
              <div className="h-3 w-24 rounded bg-velvet-800/60 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
