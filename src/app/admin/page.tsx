import { redirect } from "next/navigation";

import { getSessionUser } from "@/server/auth/session";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const currentUser = getSessionUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return <AdminDashboard currentUser={currentUser} />;
}
