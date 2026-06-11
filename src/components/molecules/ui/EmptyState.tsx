import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { SectionCard } from "molecules/ui/SectionCard";

type EmptyStateProps = {
  action?: ReactNode;
  description: ReactNode;
  title: ReactNode;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <SectionCard sx={{ borderStyle: "dashed", textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {description}
      </Typography>
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </SectionCard>
  );
}
