// Dashboard index: redirects to /dashboard/zoom.
import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/zoom");
}
