"use client";

import Button from "@mui/material/Button";
import NextLink from "next/link";
import type { ReactNode } from "react";

type MonthNavButtonProps = {
  children: ReactNode;
  href: string;
};

export function MonthNavButton({ children, href }: MonthNavButtonProps) {
  return (
    <Button component={NextLink} href={href} size="small">
      {children}
    </Button>
  );
}
