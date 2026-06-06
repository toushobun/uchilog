"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { UserThemeProvider } from "theme/UserThemeProvider";

const navItems = [
  { label: "首页", href: "/dashboard" },
  { label: "明细", href: "/transactions" },
  { label: "统计", href: "/statistics" },
  { label: "设置", href: "/settings" },
];

type AppShellProps = {
  email: string;
  children: ReactNode;
};

export function AppShell({ email, children }: AppShellProps) {
  const pathname = usePathname();
  const isCreateTransactionPage =
    pathname === "/transactions/new" ||
    pathname.startsWith("/transactions/new/");
  const isBottomNavSelected = (href: string) =>
    !isCreateTransactionPage &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <UserThemeProvider storageScope={email}>
      <Box
        sx={{
          minHeight: "100vh",
          overflowX: "hidden",
          pb: 10,
          position: "relative",
          "&::before": {
            background:
              "radial-gradient(circle, rgba(255,255,255,0.38) 0%, transparent 70%)",
            borderRadius: "50%",
            content: '""',
            height: 260,
            pointerEvents: "none",
            position: "fixed",
            right: -88,
            top: -92,
            width: 260,
            zIndex: 0,
          },
          "&::after": {
            background:
              "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
            bottom: 96,
            content: '""',
            height: 220,
            left: -90,
            pointerEvents: "none",
            position: "fixed",
            width: 220,
            zIndex: 0,
          },
        }}
      >
        <Container
          component="main"
          maxWidth="md"
          sx={{ position: "relative", py: 4, zIndex: 1 }}
        >
          {children}
        </Container>

        <Paper
          elevation={0}
          sx={{
            backdropFilter: "blur(20px)",
            bgcolor: "var(--user-theme-nav-bg)",
            borderTop: "1px solid var(--user-theme-nav-border)",
            borderRadius: 0,
            bottom: 0,
            boxShadow: "0 -8px 24px rgba(0, 0, 0, 0.08)",
            left: 0,
            position: "fixed",
            right: 0,
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 1100,
          }}
        >
          <Container maxWidth="md">
            <Stack
              component="nav"
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-around",
                minHeight: 64,
                py: 0.75,
              }}
            >
              <BottomNavButton
                href={navItems[0].href}
                label={navItems[0].label}
                selected={isBottomNavSelected(navItems[0].href)}
              />
              <BottomNavButton
                href={navItems[1].href}
                label={navItems[1].label}
                selected={isBottomNavSelected(navItems[1].href)}
              />
              <Button
                aria-label="新增记录"
                component={Link}
                href="/transactions/new"
                variant="text"
                sx={{
                  alignItems: "center",
                  bgcolor: "transparent",
                  background: "var(--user-theme-fab-bg)",
                  borderRadius: "50%",
                  boxShadow: "0 4px 16px var(--user-theme-fab-shadow)",
                  color: "#fff",
                  display: "inline-flex",
                  height: 48,
                  justifyContent: "center",
                  minWidth: 0,
                  p: 0,
                  width: 48,
                  "&:hover": {
                    bgcolor: "transparent",
                    background: "var(--user-theme-fab-bg)",
                    filter: "brightness(1.06)",
                  },
                }}
              >
                <Box
                  aria-hidden="true"
                  component="span"
                  sx={{
                    height: 20,
                    position: "relative",
                    width: 20,
                    "&::before, &::after": {
                      bgcolor: "currentColor",
                      borderRadius: 999,
                      content: '""',
                      left: "50%",
                      position: "absolute",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    },
                    "&::before": {
                      height: 3,
                      width: 20,
                    },
                    "&::after": {
                      height: 20,
                      width: 3,
                    },
                  }}
                />
              </Button>
              <BottomNavButton
                href={navItems[2].href}
                label={navItems[2].label}
                selected={isBottomNavSelected(navItems[2].href)}
              />
              <BottomNavButton
                href={navItems[3].href}
                label={navItems[3].label}
                selected={isBottomNavSelected(navItems[3].href)}
              />
            </Stack>
          </Container>
        </Paper>
      </Box>
    </UserThemeProvider>
  );
}

type BottomNavButtonProps = {
  href: string;
  label: string;
  selected: boolean;
};

function BottomNavButton({ href, label, selected }: BottomNavButtonProps) {
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
