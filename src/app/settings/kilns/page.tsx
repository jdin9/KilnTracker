import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import KilnSettingsClient from "./KilnSettingsClient";

export default function KilnSettingsPage() {
  const user = getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <KilnSettingsClient />;
}
