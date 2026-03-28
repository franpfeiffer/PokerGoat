"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth/client";
import { Link, useRouter } from "@/i18n/navigation";

interface UserMenuProps {
  displayName: string;
  avatarUrl?: string | null;
}

export function UserMenu({ displayName, avatarUrl }: UserMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function handleSignOut() {
    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    });
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Men\u00fa de ${displayName}`}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-velvet-800 text-xs font-medium text-velvet-200 transition-colors hover:bg-velvet-700"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-velvet-700/60 bg-velvet-800 p-1 shadow-xl shadow-black/30 animate-fade-in">
          <div className="border-b border-velvet-700/40 px-3 py-2 mb-1">
            <p className="text-sm font-medium text-velvet-50 truncate">
              {displayName}
            </p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="focus-ring flex w-full items-center rounded-md px-3 py-2 text-sm text-velvet-200 hover:bg-velvet-700/50 transition-colors"
          >
            {t("profile")}
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="focus-ring flex w-full items-center rounded-md px-3 py-2 text-sm text-velvet-200 hover:bg-velvet-700/50 transition-colors"
          >
            {t("settings")}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="focus-ring flex w-full items-center rounded-md px-3 py-2 text-sm text-loss hover:bg-loss-muted/20 transition-colors disabled:opacity-50"
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
