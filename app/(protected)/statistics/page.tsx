import { loadStatisticsView } from "server/loaders/statistics";
import { StatisticsTemplate } from "templates/statistics/Statistics";

export default async function StatisticsRoute({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const view = await loadStatisticsView(params.month);

  return <StatisticsTemplate {...view} />;
}
