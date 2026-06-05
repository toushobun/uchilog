import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";

type SettingsLinkCardProps = {
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
};

export function SettingsLinkCard({
  title,
  description,
  href,
  buttonLabel,
}: SettingsLinkCardProps) {
  return (
    <GlassCard
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={1}>
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>

        <Button href={href} variant="contained">
          {buttonLabel}
        </Button>
      </Stack>
    </GlassCard>
  );
}
