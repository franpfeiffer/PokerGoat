import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

const statusVariants: Record<string, "default" | "gold" | "profit" | "muted"> = {
  scheduled: "default",
  in_progress: "gold",
  completed: "profit",
  cancelled: "muted",
};

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  in_progress: "En curso",
  completed: "Finalizada",
  cancelled: "Cancelada",
};

export default function NightDetailPage() {
  const t = useTranslations("nights");

  const mockStatus = "scheduled";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">
          Noche de poker
        </h1>
        <Badge variant={statusVariants[mockStatus]}>
          {statusLabels[mockStatus]}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xs text-velvet-400 uppercase tracking-wider">
              {t("buyIn")}
            </p>
            <p className="text-xl font-bold tabular-nums text-velvet-100">
              10,00 &euro;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xs text-velvet-400 uppercase tracking-wider">
              {t("chipValue")}
            </p>
            <p className="text-xl font-bold tabular-nums text-velvet-100">
              0,10 &euro;
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-xs text-velvet-400 uppercase tracking-wider">
              {t("participants")}
            </p>
            <p className="text-xl font-bold tabular-nums text-velvet-100">0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-display text-lg font-semibold">
            {t("participants")}
          </h2>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Sin participantes"
            description="A\u00f1ade participantes para empezar"
          />
        </CardContent>
      </Card>
    </div>
  );
}
