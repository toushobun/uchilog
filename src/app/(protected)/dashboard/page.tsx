import { DashboardHome } from "dashboard-page/DashboardHome";
import { loadDashboardView } from "server/loaders/dashboard";

export default async function DashboardPage() {
  const data = await loadDashboardView();

  return <DashboardHome data={data} />;
}
