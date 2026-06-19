import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  transactionBorderColor,
  transactionMonthNavigationBackgroundColor,
} from "theme/transactionColors";

function TransactionRowSkeleton() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", py: 1.4 }}>
      <Skeleton
        variant="circular"
        width={42}
        height={42}
        sx={{ flexShrink: 0 }}
      />
      <Stack spacing={0.3} sx={{ flex: 1 }}>
        <Skeleton width="55%" sx={{ fontSize: 14 }} />
        <Skeleton width="35%" sx={{ fontSize: 11 }} />
        <Skeleton width="50%" sx={{ fontSize: 11 }} />
      </Stack>
      <Skeleton width={52} sx={{ fontSize: 15, flexShrink: 0 }} />
    </Stack>
  );
}

export default function TransactionsLoadingPage() {
  return (
    <Stack
      role="status"
      aria-label="页面数据加载中"
      aria-busy="true"
      spacing={2.2}
    >
      <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900 }}>
        明细
      </Typography>

      {/* 月导航胶囊：‹ | 月份 | › */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          bgcolor: transactionMonthNavigationBackgroundColor,
          borderRadius: 999,
          color: "text.secondary",
          height: 44,
          justifyContent: "space-between",
          px: 1.3,
        }}
      >
        <Skeleton width={24} sx={{ fontSize: 16 }} />
        <Skeleton width={80} sx={{ fontSize: 16 }} />
        <Skeleton width={24} sx={{ fontSize: 16 }} />
      </Stack>

      {/* 收支汇总栏：收入 | 支出 | 结余 */}
      <Box
        sx={{
          bgcolor: "background.paper",
          border: `1px solid ${transactionBorderColor}`,
          borderRadius: 1,
          mt: 1.5,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2,
            py: 1.5,
            "& > * + *": { borderLeft: `1px solid ${transactionBorderColor}` },
          }}
        >
          {[0, 1, 2].map((i) => (
            <Stack key={i} spacing={0.4} sx={{ alignItems: "center", flex: 1 }}>
              <Skeleton width={24} sx={{ fontSize: 12 }} />
              <Skeleton width={48} sx={{ fontSize: 16 }} />
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* 日期分组列表 × 2 */}
      <Stack
        sx={{
          left: { xs: "50%", sm: "auto" },
          overflow: "hidden",
          position: { xs: "relative", sm: "static" },
          transform: { xs: "translateX(-50%)", sm: "none" },
          width: { xs: "100vw", sm: "auto" },
        }}
      >
        {[3, 2].map((rowCount, gi) => (
          <Box key={gi}>
            {/* 日期表头行 */}
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.6,
                py: 0.8,
              }}
            >
              <Skeleton width={60} sx={{ fontSize: 13 }} />
              <Skeleton width={48} sx={{ fontSize: 13 }} />
            </Stack>

            {/* 交易记录行组 */}
            <Stack
              sx={{
                bgcolor: "background.paper",
                boxShadow: "0 10px 24px rgba(77, 55, 120, 0.05)",
                overflow: "hidden",
                px: 1.6,
                "& > * + *": {
                  borderTop: `1px solid ${transactionBorderColor}`,
                },
              }}
            >
              {Array.from({ length: rowCount }).map((_, i) => (
                <TransactionRowSkeleton key={i} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
