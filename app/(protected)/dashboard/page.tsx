import { loadDashboardView } from "server/loaders/dashboard";
import { DashboardTemplate } from "templates/dashboard/Dashboard";

export default async function DashboardPage() {
  const data = await loadDashboardView();

  return <DashboardTemplate data={data} />;
}
