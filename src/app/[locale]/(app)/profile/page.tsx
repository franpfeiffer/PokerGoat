import type { Metadata } from "next";
import { ProfileLoader } from "@/components/profile/profile-loader";

export const metadata: Metadata = {
  title: "Perfil",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl py-2">
      <ProfileLoader />
    </div>
  );
}
