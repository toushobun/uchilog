import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type PageHeaderProps = {
  action?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function PageHeader({ action, subtitle, title }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography component="div" color="text.secondary" sx={{ mt: 1.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
}
