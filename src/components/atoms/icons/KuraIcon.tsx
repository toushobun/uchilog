import type { SvgIconProps } from "@mui/material/SvgIcon";

import { kuraIconRegistry, type KuraIconName } from "./kuraIconRegistry";

export type KuraIconSize = "sm" | "md" | "lg";

type KuraIconProps = Omit<SvgIconProps, "children" | "component"> & {
  name: KuraIconName;
  size?: KuraIconSize;
  title?: string;
};

const kuraIconSizeMap = {
  sm: 20,
  md: 24,
  lg: 32,
} as const satisfies Record<KuraIconSize, number>;

export function KuraIcon({
  name,
  size = "md",
  sx,
  title,
  ...props
}: KuraIconProps) {
  const Icon = kuraIconRegistry[name];

  return (
    <Icon
      aria-hidden={title ? undefined : true}
      aria-label={title}
      role={title ? "img" : undefined}
      sx={[
        {
          color: "inherit",
          fontSize: kuraIconSizeMap[size],
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      titleAccess={title}
      {...props}
    />
  );
}
