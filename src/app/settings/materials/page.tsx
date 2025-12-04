import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import MaterialsSettingsClient from "./MaterialsSettingsClient";

export default async function MaterialsSettingsPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <MaterialsSettingsClient />;
}
