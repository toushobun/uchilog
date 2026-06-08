import { loadStatisticsView } from "server/loaders/statistics";
import { StatisticsTemplate } from "templates/statistics/Statistics";

export default async function StatisticsRoute() {
  const view = await loadStatisticsView();

  return <StatisticsTemplate {...view} />;
}
