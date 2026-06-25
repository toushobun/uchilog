import Card, { type CardProps } from "@mui/material/Card";

import { designTokens } from "theme/theme";

export function SectionCard({ sx, ...props }: CardProps) {
  return (
    <Card
      sx={[
        {
          backgroundColor: "var(--user-theme-card-bg)",
          backgroundImage: "none",
          border: "1px solid var(--user-theme-card-border)",
          borderRadius: `${designTokens.radius.lg}px`,
          boxShadow: "var(--user-theme-card-shadow)",
          p: designTokens.spacing.card,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
