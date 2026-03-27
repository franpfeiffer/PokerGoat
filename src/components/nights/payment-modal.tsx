"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils/currency";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  player: {
    displayName: string;
    avatarUrl: string | null;
    bankAlias: string | null;
    totalCashout: number;
  } | null;
}

export function PaymentModal({ open, onClose, player }: PaymentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const locale = useLocale();
  const t = useTranslations("payment");
  const [copied, setCopied] = useState(false);

  const titleId = "payment-modal-title";
  const moneyLocale = locale === "es" ? "es-AR" : "en-US";
  const amountToPay = player ? Math.max(0, player.totalCashout) : 0;
  const hasDebt = amountToPay > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setCopied(false);
      dialog.showModal();
      // Defer focus to close button after animation frame
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      dialog.close();
    }
  }, [open]);

  function handleCopy() {
    if (!player?.bankAlias) return;
    navigator.clipboard.writeText(player.bankAlias).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      onClose();
    }
  }

  if (!player) return null;

  return (
    <dialog
      ref={dialogRef}
      id="payment-modal"
      aria-labelledby={titleId}
      aria-modal="true"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="payment-modal mx-3 my-auto w-full max-w-sm p-0 text-foreground backdrop:bg-black/75 backdrop:backdrop-blur-sm sm:mx-auto"
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Outer shell */}
      <div className="relative rounded-2xl border border-velvet-700/60 bg-velvet-950 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.9)] overflow-hidden">

        {/* Gold accent line top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

        {/* Subtle radial glow behind amount */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: hasDebt
              ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(52,211,117,0.06) 0%, transparent 70%)"
              : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200,164,56,0.04) 0%, transparent 70%)",
          }}
        />

        <div className="relative px-5 pb-6 pt-4">

          {/* Header row */}
          <div className="mb-6 flex items-center justify-between">
            <span
              id={titleId}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-velvet-500"
            >
              {t("title")}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="focus-ring -mr-1 rounded-lg p-1.5 text-velvet-600 transition-colors hover:bg-velvet-800/80 hover:text-velvet-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Player identity */}
          <div className="mb-6 flex items-center gap-3.5">
            <div className="shrink-0">
              <Avatar src={player.avatarUrl} name={player.displayName} size="lg" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold leading-tight text-velvet-50">
                {player.displayName}
              </p>
              <p className="mt-0.5 text-xs text-velvet-500">{t("recipient")}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-5 h-px bg-velvet-800/80" />

          {/* Amount — hero element */}
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-velvet-500">
              {t("amountLabel")}
            </p>
            <div className="flex items-baseline gap-3">
              <span
                className={`font-display text-4xl font-bold tabular-nums leading-none ${
                  hasDebt ? "text-profit" : "text-velvet-600"
                }`}
              >
                {formatCurrency(amountToPay, moneyLocale, "ARS")}
              </span>
              {!hasDebt && (
                <span className="rounded-full border border-velvet-700/60 bg-velvet-800/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-velvet-500">
                  {t("noDebt")}
                </span>
              )}
            </div>
          </div>

          {/* Alias / CVU */}
          {player.bankAlias ? (
            <div className="group mt-5 flex items-center justify-between gap-3 rounded-xl border border-velvet-700/50 bg-velvet-900/60 px-4 py-3.5 transition-colors hover:border-velvet-600/60">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-velvet-600">
                  {t("aliasLabel")}
                </p>
                <span className="block truncate font-mono text-sm text-velvet-200">
                  {player.bankAlias}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={copied ? t("copied") : t("copy")}
                className={`focus-ring relative shrink-0 overflow-hidden rounded-lg px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  copied
                    ? "bg-profit/15 text-profit border border-profit/25"
                    : "border border-velvet-700/80 bg-velvet-800 text-velvet-300 hover:border-gold-600/40 hover:bg-velvet-700 hover:text-gold-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      {t("copy")}
                    </>
                  )}
                </span>
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-velvet-800 px-4 py-3.5 text-center">
              <p className="text-xs text-velvet-600">{t("noAlias")}</p>
            </div>
          )}
        </div>

        {/* Gold accent line bottom */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>
    </dialog>
  );
}
