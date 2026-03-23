import type { Metadata } from "next";
import { PreflopView } from "@/components/preflop/preflop-view";

export const metadata: Metadata = {
  title: "GoatEye",
};

export default function GoatEyePage() {
  return <PreflopView />;
}
