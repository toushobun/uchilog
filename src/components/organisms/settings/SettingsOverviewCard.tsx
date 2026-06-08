import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { PageCard } from "molecules/ui/PageCard";
import type { ServerAction } from "types/actions";

type SettingsOverviewCardProps = {
  currentLedgerName: string;
  email: string;
  logoutAction: ServerAction;
};

export function SettingsOverviewCard({
  currentLedgerName,
  email,
  logoutAction,
}: SettingsOverviewCardProps) {
  return (
    <PageCard>
      <Stack
        direction="row"
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Box>
          <Link href={routePaths.dashboard} style={{ textDecoration: "none" }}>
            <Typography
              variant="h4"
              sx={{
                background: "var(--user-theme-title-gradient)",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: 700,
                WebkitBackgroundClip: "text",
              }}
            >
              UchiLog
            </Typography>
          </Link>
          <Link href={routePaths.ledgers} style={{ textDecoration: "none" }}>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
              当前账本：{currentLedgerName}
            </Typography>
          </Link>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            {email}
          </Typography>
        </Box>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outlined"
            size="small"
            sx={{
              borderColor: "rgba(0, 0, 0, 0.2)",
              color: "text.secondary",
              whiteSpace: "nowrap",
            }}
          >
            登出
          </Button>
        </form>
      </Stack>
      <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mt: 3 }}>
        设置
      </Typography>
    </PageCard>
  );
}
