import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Editar noche",
};

export default function EditNightPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <h1 className="font-display text-xl font-bold">Editar noche</h1>
        </CardHeader>
        <CardContent>
          <p className="text-velvet-400">Formulario de edici\u00f3n aqu\u00ed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
