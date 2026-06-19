import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

import { SectionCard } from "molecules/ui/SectionCard";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

export default function SettingsLoadingPage() {
  return (
    <PageShell>
      <PageHeader title="设置" />

      {/* SettingsOverviewCard スケルトン */}
      <SectionCard>
        <Skeleton width="40%" sx={{ fontSize: 18 }} />
        <Skeleton width="60%" sx={{ fontSize: 14, mt: 1 }} />
        <Skeleton
          variant="rounded"
          width={100}
          height={36}
          sx={{ borderRadius: 1, mt: 2 }}
        />
      </SectionCard>

      {/* エントリ行スケルトン（Accounts / Categories） */}
      {[0, 1].map((i) => (
        <SectionCard key={i}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Skeleton width="40%" sx={{ fontSize: 16 }} />
            <Skeleton width={24} sx={{ fontSize: 16 }} />
          </Stack>
        </SectionCard>
      ))}

      {/* SettingsThemeSection スケルトン */}
      <SectionCard>
        <Skeleton width="30%" sx={{ fontSize: 16, mb: 1.5 }} />
        <Stack direction="row" spacing={1}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="circular" width={36} height={36} />
          ))}
        </Stack>
      </SectionCard>
    </PageShell>
  );
}
