import type { PaperProps } from "@mui/material/Paper";

import { GlassCard } from "atoms/ui/GlassCard";

export function PageCard({ sx, ...props }: PaperProps) {
  return <GlassCard sx={{ p: { xs: 4, sm: 5 }, ...sx }} {...props} />;
}
