import Card, { type CardProps } from "@mui/material/Card";

import { designTokens } from "theme/theme";

export function SectionCard({ sx, ...props }: CardProps) {
  return (
    <Card
      sx={[
        {
          p: designTokens.spacing.card,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
