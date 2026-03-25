import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";
import { AuthGuard } from "@/components/auth/auth-guard";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { PushPermission } from "@/components/layout/push-permission";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex min-h-svh overflow-x-clip">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 min-w-0 overflow-x-clip px-3 py-5 pb-24 sm:px-4 sm:py-6 sm:pb-24 lg:px-8 lg:pb-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-velvet-700 border-t-gold-500" />
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
          </div>
          <MobileNav />
          <OfflineIndicator />
          <PushPermission />
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
