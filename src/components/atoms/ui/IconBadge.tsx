import Box, { type BoxProps } from "@mui/material/Box";
import type { ReactNode } from "react";

export type IconBadgeSize = "sm" | "md" | "lg";

type IconBadgeProps = Omit<BoxProps, "children"> & {
  children: ReactNode;
  label?: string;
  size?: IconBadgeSize;
};

const iconBadgeSizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
} as const satisfies Record<IconBadgeSize, number>;

export function IconBadge({
  children,
  label,
  size = "md",
  sx,
  ...props
}: IconBadgeProps) {
  const badgeSize = iconBadgeSizeMap[size];

  return (
    <Box
      aria-hidden={label ? undefined : true}
      aria-label={label}
      component="span"
      role={label ? "img" : undefined}
      sx={[
        {
          alignItems: "center",
          backgroundColor: "var(--user-theme-icon-badge-bg)",
          borderRadius: 1.5,
          color: "var(--user-theme-icon-badge-color)",
          display: "inline-flex",
          flexShrink: 0,
          fontWeight: 800,
          height: badgeSize,
          justifyContent: "center",
          width: badgeSize,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}
