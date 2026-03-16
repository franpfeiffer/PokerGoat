import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NightForm } from "@/components/nights/night-form";
import { createNight } from "@/lib/actions/nights";

export const metadata: Metadata = {
  title: "Nueva noche de poker",
};

export default async function NewNightPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  async function handleCreateNight(formData: FormData) {
    "use server";
    const userId = "placeholder-user-id";
    return createNight(groupId, userId, formData);
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">
            Nueva noche de poker
          </h1>
        </CardHeader>
        <CardContent>
          <NightForm
            groupId={groupId}
            action={handleCreateNight}
            defaults={{ chipValue: 0.1, buyIn: 10 }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
