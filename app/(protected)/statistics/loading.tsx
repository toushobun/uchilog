import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

import { SectionCard } from "molecules/ui/SectionCard";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

export default function StatisticsLoadingPage() {
  return (
    <Box role="status" aria-label="页面数据加载中" aria-busy="true">
      <PageShell>
        <PageHeader title="统计" />

        {/* 月份导航与汇总卡片骨架 */}
        <SectionCard>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Skeleton width={64} sx={{ fontSize: 14 }} />
            <Skeleton width={80} sx={{ fontSize: 16 }} />
            <Skeleton width={64} sx={{ fontSize: 14 }} />
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Skeleton
              variant="rounded"
              height={68}
              sx={{ borderRadius: 1, flex: 1 }}
            />
            <Skeleton
              variant="rounded"
              height={68}
              sx={{ borderRadius: 1, flex: 1 }}
            />
            <Skeleton
              variant="rounded"
              height={68}
              sx={{ borderRadius: 1, flex: 1 }}
            />
          </Stack>
        </SectionCard>

        {/* 排行榜区域骨架 */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {[0, 1].map((col) => (
            <SectionCard key={col} sx={{ flex: 1 }}>
              <Skeleton width="50%" sx={{ fontSize: 20, mb: 2 }} />
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={48}
                  sx={{ borderRadius: 1, mb: 1 }}
                />
              ))}
            </SectionCard>
          ))}
        </Stack>
      </PageShell>
    </Box>
  );
}
