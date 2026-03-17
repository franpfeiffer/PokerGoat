"use client";

import { authClient } from "@/lib/auth/client";
import { UserMenu } from "@/components/auth/user-menu";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const { data: session } = authClient.useSession();

  const displayName = session?.user?.name || "Usuario";
  const avatarUrl = session?.user?.image;

  return (
    <header className="flex h-14 items-center justify-between border-b border-velvet-700/60 bg-velvet-900 px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="font-display text-base font-bold tracking-wide text-gold-500">
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
