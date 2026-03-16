import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupCardProps {
  id: string;
  name: string;
  description: string | null;
  role: "leader" | "temporary_leader" | "member";
  memberCount?: number;
  currency: string;
}

const roleLabels: Record<string, string> = {
  leader: "L\u00edder",
  temporary_leader: "L\u00edder temporal",
  member: "Miembro",
};

export function GroupCard({
  id,
  name,
  description,
  role,
  currency,
}: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`} className="focus-ring block rounded-xl">
      <Card className="transition-colors hover:border-velvet-600 hover:bg-surface-elevated/50">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-velvet-50 truncate">
              {name}
            </h3>
            <Badge variant={role === "leader" ? "gold" : "default"}>
              {roleLabels[role]}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-velvet-400 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-velvet-500">
            <span>{currency}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
