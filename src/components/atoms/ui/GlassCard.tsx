import Paper, { type PaperProps } from "@mui/material/Paper";

export function GlassCard({ sx, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          backdropFilter: "blur(14px)",
          backgroundColor: "var(--user-theme-card-bg)",
          backgroundImage: "none",
          border: "1px solid var(--user-theme-card-border)",
          boxShadow: "var(--user-theme-card-shadow)",
          WebkitBackdropFilter: "blur(14px)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
