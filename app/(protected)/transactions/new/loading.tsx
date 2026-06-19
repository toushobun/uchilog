import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { PageShell } from "templates/layout/PageShell";

export default function TransactionsNewLoadingPage() {
  return (
    <Box role="status" aria-label="页面数据加载中" aria-busy="true">
      <PageShell>
        <Stack spacing={2.5}>
          {/* 顶部操作栏：关闭 | 新增记账 | 保存 */}
          <Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Skeleton width={48} sx={{ fontSize: 14 }} />
              <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
                新增记账
              </Typography>
              <Skeleton width={48} sx={{ fontSize: 14 }} />
            </Stack>
            {/* 账本名称 */}
            <Skeleton width={100} sx={{ alignSelf: "center", fontSize: 12 }} />
          </Stack>

          {/* 类型切换：支出 | 收入 */}
          <Skeleton variant="rounded" height={42} sx={{ borderRadius: 1 }} />

          {/* 商家选择 */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* 账户选择 */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* 消费明细卡片 */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                消费明细
              </Typography>
              <Skeleton
                variant="rounded"
                height={48}
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Paper>

          {/* 标签卡片 */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                标签（选填）
              </Typography>
              <Skeleton width="60%" sx={{ fontSize: 12 }} />
            </Stack>
          </Paper>

          {/* 备注 */}
          <Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} />

          {/* 保存前汇总卡片 */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                保存前汇总
              </Typography>
              {["商家", "账户", "标签", "合计金额"].map((label) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Skeleton width={40} sx={{ fontSize: 14 }} />
                  <Skeleton width={80} sx={{ fontSize: 14 }} />
                </Stack>
              ))}
            </Stack>
          </Paper>

          {/* 发生时间 */}
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} />

          {/* 保存按钮 */}
          <Skeleton variant="rounded" height={42} sx={{ borderRadius: 1 }} />
        </Stack>
      </PageShell>
    </Box>
  );
}
