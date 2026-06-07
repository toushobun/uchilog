"use client";

import Button from "@mui/material/Button";
import Link from "next/link";

type BottomNavButtonProps = {
  href: string;
  label: string;
  selected: boolean;
};

export function BottomNavButton({
  href,
  label,
  selected,
}: BottomNavButtonProps) {
  return (
    <Button
      aria-current={selected ? "page" : undefined}
      component={Link}
      href={href}
      size="small"
      variant="text"
      sx={{
        bgcolor: selected
          ? "var(--user-theme-bottom-nav-active-bg)"
          : "transparent",
        borderRadius: 2,
        color: selected
          ? "var(--user-theme-bottom-nav-active)"
          : "var(--user-theme-bottom-nav-inactive)",
        fontWeight: selected ? 700 : 500,
        minWidth: 52,
      }}
    >
      {label}
    </Button>
  );
}
