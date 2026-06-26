import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

import { kuraIconRegistry, type KuraIconName } from "./kuraIconRegistry";

export type KuraIconSize = "sm" | "md" | "lg";

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 64,
} as const satisfies Record<KuraIconSize, number>;

export type KuraIconProps = {
  /** 要显示的图标名称，会从 registry 中解析 src / label */
  name: KuraIconName;
  /** 无障碍标签。省略时使用 registry 中的默认 label */
  label?: string;
  /** true 时作为装饰图标隐藏无障碍信息 */
  decorative?: boolean;
  size?: KuraIconSize | number;
  sx?: SxProps<Theme>;
  className?: string;
};

export function KuraIcon({
  name,
  label,
  decorative = false,
  size = "md",
  sx,
  className,
}: KuraIconProps) {
  const entry = kuraIconRegistry[name];
  const px = typeof size === "number" ? size : sizeMap[size];
  const resolvedLabel = decorative ? "" : (label ?? entry.label);

  return (
    <Box
      alt={resolvedLabel}
      aria-hidden={decorative ? true : undefined}
      className={className}
      component="img"
      src={entry.src}
      sx={[
        {
          display: "inline-block",
          flexShrink: 0,
          height: px,
          objectFit: "contain",
          width: px,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
