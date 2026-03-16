"use client";

import { authClient } from "@/lib/auth/client";
import { UserMenu } from "@/components/auth/user-menu";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const { data: session } = authClient.useSession();

  const displayName = session?.user?.name || "Usuario";
  const avatarUrl = session?.user?.image;

  return (
    <header className="flex h-16 items-center justify-between border-b border-velvet-700 bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <span className="font-display text-lg font-bold text-gold-500">
          PokerGoat
        </span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <UserMenu displayName={displayName} avatarUrl={avatarUrl} />
      </div>
    </header>
  );
}
