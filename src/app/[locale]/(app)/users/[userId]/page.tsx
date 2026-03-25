import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById, getUserStats, getUserProfitHistory } from "@/lib/db/queries/users";
import { PublicProfileContent } from "@/components/profile/public-profile-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserById(userId);
  if (!user) {
    return { title: "Usuario no encontrado" };
  }
  return {
    title: user.displayName,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    notFound();
  }

  const [stats, profitHistory] = await Promise.all([
    getUserStats(userId),
    getUserProfitHistory(userId),
  ]);

  return (
    <div className="mx-auto max-w-2xl py-2">
      <PublicProfileContent
        userId={user.id}
        displayName={user.displayName}
        avatarUrl={user.avatarUrl}
        stats={stats}
        profitHistory={profitHistory}
      />
    </div>
  );
}