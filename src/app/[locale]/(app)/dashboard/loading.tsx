import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl py-2 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-48 sm:h-10" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-full rounded-xl sm:h-10 sm:w-32" />
          <Skeleton className="h-11 w-full rounded-xl sm:h-10 sm:w-36" />
        </div>
      </div>
      {/* Upcoming nights banner */}
      <Skeleton className="h-16 w-full rounded-xl" />
      {/* Stats widget — 3 cards */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-velvet-700/60 bg-velvet-900 p-4 flex flex-col gap-2 items-center">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Groups grid */}
      <div className="rounded-xl border border-velvet-700/60 bg-velvet-900 p-4 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
