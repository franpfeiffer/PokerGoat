"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { UserMenu } from "@/components/auth/user-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { getOrCreateProfile } from "@/lib/actions/profile";

export function Header() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const displayName = session?.user?.name || "Usuario";

  const loadProfile = useCallback(async () => {
    if (!session?.user) return;
    const { profile, isNew } = await getOrCreateProfile({
      authUserId: session.user.id,
      displayName: session.user.name || session.user.email.split("@")[0],
      avatarUrl: session.user.image ?? undefined,
    });
    if (profile?.avatarUrl) {
      setProfileAvatar(profile.avatarUrl);
    }
    if (isNew) {
      fetch("/api/notify-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session.user.name ?? "Usuario",
          email: session.user.email,
        }),
      }).catch(() => {});
    }
  }, [session?.user]);

  // Only fetch profile on mount to get custom avatar
  useEffect(() => {
    if (sessionPending || !session?.user) return;
    loadProfile();
  }, [sessionPending, session?.user?.id, loadProfile]);

  // Refresh avatar when user updates profile from another component
  useEffect(() => {
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, [loadProfile]);

  const avatarUrl = profileAvatar || session?.user?.image;

  return (
    <header className="flex h-14 items-center justify-between border-b border-velvet-800 bg-velvet-950 px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="font-display text-base font-bold text-gold-500">
          PokerGoat
        </span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <UserMenu displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
