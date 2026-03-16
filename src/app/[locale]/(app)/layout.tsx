import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";
import { AuthGuard } from "@/components/auth/auth-guard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ToastProvider>
        <div className="flex min-h-svh">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 px-4 py-6 pb-20 lg:px-8 lg:pb-6">
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
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
