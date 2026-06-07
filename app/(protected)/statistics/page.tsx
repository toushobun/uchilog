import { StatisticsPage as StatisticsPageView } from "statistics-page/StatisticsPage";
import { loadStatisticsView } from "server/loaders/statistics";

export default async function StatisticsPage() {
  const view = await loadStatisticsView();

  return <StatisticsPageView {...view} />;
}
