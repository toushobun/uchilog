import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { SectionCard } from "molecules/ui/SectionCard";

type EmptyStateProps = {
  action?: ReactNode;
  description?: ReactNode;
  illustration?: ReactNode;
  title: ReactNode;
};

export function EmptyState({
  action,
  description,
  illustration,
  title,
}: EmptyStateProps) {
  return (
    <SectionCard sx={{ borderStyle: "dashed", textAlign: "center" }}>
      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
        {illustration ? <Box>{illustration}</Box> : null}
        <Typography
          variant="h6"
          sx={{ color: "var(--user-theme-balance-text)", fontWeight: 800 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            component="div"
            sx={{ color: "var(--user-theme-section-text)" }}
          >
            {description}
          </Typography>
        ) : null}
        {action ? <Box sx={{ mt: 0.5 }}>{action}</Box> : null}
      </Stack>
    </SectionCard>
  );
}
