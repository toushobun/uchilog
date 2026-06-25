import Paper, { type PaperProps } from "@mui/material/Paper";

export function SoftCard({ sx, ...props }: PaperProps) {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          backgroundColor: "var(--user-theme-card-bg)",
          backgroundImage: "none",
          border: "1px solid var(--user-theme-card-border)",
          boxShadow: "var(--user-theme-card-shadow)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
