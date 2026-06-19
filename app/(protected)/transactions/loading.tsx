import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { transactionMonthNavigationBackgroundColor } from "theme/transactionColors";

export default function TransactionsLoadingPage() {
  return (
    <Stack spacing={2.2}>
      <Typography component="h1" sx={{ fontSize: 24, fontWeight: 900 }}>
        明细
      </Typography>

      {/* 月ナビ pill スケルトン */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          bgcolor: transactionMonthNavigationBackgroundColor,
          borderRadius: 999,
          height: 44,
          justifyContent: "center",
          px: 1.3,
        }}
      >
        <Skeleton width={80} sx={{ fontSize: 16 }} />
      </Stack>

      {/* 取引行スケルトン */}
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
        {[0, 1, 2, 3, 4].map((i) => (
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
              <Skeleton width="35%" sx={{ fontSize: 11 }} />
            </Stack>
            <Skeleton width={52} sx={{ fontSize: 15, flexShrink: 0 }} />
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}
