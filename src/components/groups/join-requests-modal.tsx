"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { getOrCreateProfile } from "@/lib/actions/profile";
import { approveJoinRequest, rejectJoinRequest } from "@/lib/actions/groups";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useHaptic } from "@/hooks/use-haptic";

interface JoinRequest {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

interface JoinRequestsModalProps {
  requests: JoinRequest[];
}

export function JoinRequestsModal({ requests }: JoinRequestsModalProps) {
  const t = useTranslations("groups");
  const tCommon = useTranslations("common");
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const haptic = useHaptic();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleAction(requestId: string, action: "approve" | "reject") {
    startTransition(async () => {
      if (!session?.user) return;
      setError(null);

      const { profile } = await getOrCreateProfile({
        authUserId: session.user.id,
        displayName: session.user.name || session.user.email.split("@")[0],
        avatarUrl: session.user.image ?? undefined,
      });

      const result =
        action === "approve"
          ? await approveJoinRequest(requestId, profile.id)
          : await rejectJoinRequest(requestId, profile.id);

      if (result.error) {
        haptic.error();
        setError(typeof result.error === "string" ? result.error : tCommon("error"));
        return;
      }
      haptic.success();
      router.refresh();
    });
  }

  if (requests.length === 0) return null;

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        {t("pendingRequests")}
        <Badge variant="gold" className="ml-1">
          {requests.length}
        </Badge>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-x border-velvet-700 bg-surface animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-velvet-700/60 bg-surface px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-velvet-50">
                  {t("pendingRequests")}
                </h2>
                <Badge variant="gold" className="text-xs">
                  {requests.length}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
                className="focus-ring rounded-full p-2 text-velvet-400 hover:bg-velvet-800 hover:text-velvet-200 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto overscroll-contain p-4 sm:px-5 sm:py-5 max-h-[calc(85vh-80px)]">
              {error && (
                <div className="mb-4 rounded-xl border border-loss/30 bg-loss/10 px-4 py-3 text-sm text-loss backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-3">
                {requests.map((req, index) => (
                  <div
                    key={req.id}
                    className="group relative overflow-hidden rounded-xl border border-velvet-700/50 bg-velvet-800/40 p-4 transition-all hover:border-velvet-600/60 hover:bg-velvet-800/60"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar src={req.avatarUrl} name={req.displayName} size="md" />
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-profit/60" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-velvet-50">
                          {req.displayName}
                        </p>
                        <p className="text-xs text-velvet-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAction(req.id, "approve")}
                        disabled={isPending}
                        className="flex-1 bg-profit/15 text-profit hover:bg-profit/25 border border-profit/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {t("approve")}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={isPending}
                        className="flex-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1.5"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                        {t("reject")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
