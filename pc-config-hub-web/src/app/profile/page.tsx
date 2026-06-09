import { redirect } from "next/navigation";

import ProfileSettingsCopy from "@/app/profile/profile-settings-copy";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileSettingsCopy user={user} />
  );
}
