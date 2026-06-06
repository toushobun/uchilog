import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassCard sx={{ mt: 4, p: 3, borderStyle: "dashed" }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {description}
      </Typography>
    </GlassCard>
  );
}
