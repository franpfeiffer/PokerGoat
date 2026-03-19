import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/constants";

export function revalidateLocalized(path: string) {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${path}`);
  }
}
