import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const currentUser = await getSessionUser();

  if (!currentUser) {
    redirect("/signin");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <AdminDashboard currentUser={currentUser} />;
}
