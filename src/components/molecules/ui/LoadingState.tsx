import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { SectionCard } from "molecules/ui/SectionCard";

type LoadingStateProps = {
  description?: ReactNode;
  title?: ReactNode;
};

export function LoadingState({
  description = "数据读取中，请稍等。",
  title = "读取中",
}: LoadingStateProps) {
  return (
    <SectionCard role="status">
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
        <CircularProgress aria-hidden="true" size={28} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary">{description}</Typography>
        ) : null}
      </Stack>
    </SectionCard>
  );
}
