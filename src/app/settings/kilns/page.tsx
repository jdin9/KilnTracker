import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import KilnSettingsClient from "./KilnSettingsClient";

export default async function KilnSettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <KilnSettingsClient />;
}
