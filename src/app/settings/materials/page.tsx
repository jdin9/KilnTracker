import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import MaterialsSettingsClient from "./MaterialsSettingsClient";

export default function MaterialsSettingsPage() {
  const user = getSessionUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <MaterialsSettingsClient />;
}
