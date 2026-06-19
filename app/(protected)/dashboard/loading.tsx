import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { transactionSummaryBackgroundColor } from "theme/transactionColors";

export default function DashboardLoadingPage() {
  return (
    <Stack
      role="status"
      aria-label="页面数据加载中"
      aria-busy="true"
      spacing={2.5}
    >
      {/* 月度汇总卡片骨架 */}
      <Box
        sx={{
          bgcolor: transactionSummaryBackgroundColor,
          borderRadius: 2,
          p: 2.5,
        }}
      >
        <Skeleton width="35%" sx={{ fontSize: 13, mb: 0.8 }} />
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Stack spacing={0.3}>
            <Skeleton width={28} sx={{ fontSize: 12 }} />
            <Skeleton width={100} sx={{ fontSize: 32 }} />
          </Stack>
          <Stack spacing={1}>
            <Skeleton width={72} sx={{ fontSize: 17 }} />
            <Skeleton width={72} sx={{ fontSize: 17 }} />
          </Stack>
        </Stack>
      </Box>

      {/* 最近记录骨架 */}
      <Stack spacing={0}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 900 }}>
            最近记录
          </Typography>
          <Skeleton width={44} sx={{ fontSize: 13 }} />
        </Stack>
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: "0 10px 24px rgba(77, 55, 120, 0.06)",
            left: { xs: "50%", sm: "auto" },
            overflow: "hidden",
            position: { xs: "relative", sm: "static" },
            px: 1.6,
            transform: { xs: "translateX(-50%)", sm: "none" },
            width: { xs: "100vw", sm: "auto" },
          }}
        >
          {[0, 1, 2].map((i) => (
            <Stack
              key={i}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", py: 1.4 }}
            >
              <Skeleton
                variant="circular"
                width={42}
                height={42}
                sx={{ flexShrink: 0 }}
              />
              <Stack spacing={0.3} sx={{ flex: 1 }}>
                <Skeleton width="55%" sx={{ fontSize: 14 }} />
                <Skeleton width="40%" sx={{ fontSize: 11 }} />
                <Skeleton width="50%" sx={{ fontSize: 11 }} />
              </Stack>
              <Skeleton width={52} sx={{ fontSize: 15, flexShrink: 0 }} />
            </Stack>
          ))}
        </Box>
      </Stack>

      {/* 周期支出骨架 */}
      <Stack direction="row" spacing={1.5}>
        <Skeleton
          variant="rounded"
          height={72}
          sx={{ borderRadius: 1, flex: 1 }}
        />
        <Skeleton
          variant="rounded"
          height={72}
          sx={{ borderRadius: 1, flex: 1 }}
        />
      </Stack>
    </Stack>
  );
}
