"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup, {
  type ToggleButtonGroupProps,
} from "@mui/material/ToggleButtonGroup";
import type { ReactNode } from "react";

export type SegmentTabItem = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

type SegmentTabsProps = Omit<
  ToggleButtonGroupProps,
  "children" | "exclusive" | "fullWidth" | "onChange" | "value"
> & {
  ariaLabel: string;
  fullWidth?: boolean;
  items: readonly SegmentTabItem[];
  onChange: (value: string) => void;
  value: string;
};

export function SegmentTabs({
  ariaLabel,
  fullWidth = true,
  items,
  onChange,
  sx,
  value,
  ...props
}: SegmentTabsProps) {
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      exclusive
      fullWidth={fullWidth}
      value={value}
      onChange={(_, nextValue: string | null) => {
        if (!nextValue || nextValue === value) {
          return;
        }

        onChange(nextValue);
      }}
      sx={[
        {
          backgroundColor: "var(--user-theme-segment-bg)",
          border: 0,
          borderRadius: 1.5,
          gap: 0,
          p: 0.5,
          "& .MuiToggleButton-root": {
            border: 0,
            borderRadius: 1.25,
            color: "var(--user-theme-segment-text)",
            fontWeight: 800,
            minHeight: 36,
            px: 2,
            py: 0.75,
          },
          "& .MuiToggleButton-root.Mui-selected": {
            backgroundColor: "var(--user-theme-segment-selected-bg)",
            boxShadow: "var(--user-theme-card-shadow)",
            color: "var(--user-theme-segment-selected-text)",
          },
          "& .MuiToggleButton-root.Mui-selected:hover": {
            backgroundColor: "var(--user-theme-segment-selected-bg)",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {items.map((item) => (
        <ToggleButton
          disabled={item.disabled}
          key={item.value}
          value={item.value}
        >
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
