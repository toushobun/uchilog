import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type PageHeaderProps = {
  action?: ReactNode;
  leading?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  action,
  leading,
  subtitle,
  title,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start", flex: 1, minWidth: 0 }}
      >
        {leading ? <Box sx={{ flexShrink: 0 }}>{leading}</Box> : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{ color: "var(--user-theme-balance-text)", fontWeight: 800 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              component="div"
              sx={{ color: "var(--user-theme-subtitle-text)", mt: 1.5 }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
}
