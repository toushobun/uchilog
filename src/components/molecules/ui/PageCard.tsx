import type { PaperProps } from "@mui/material/Paper";

import { SoftCard } from "atoms/ui/SoftCard";

export function PageCard({ sx, ...props }: PaperProps) {
  return <SoftCard sx={{ p: { xs: 4, sm: 5 }, ...sx }} {...props} />;
}
