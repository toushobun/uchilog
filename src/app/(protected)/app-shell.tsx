"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { UserThemeProvider } from "theme/UserThemeProvider";

import { logout } from "./actions";

const navItems = [
  { label: "首页", href: "/dashboard" },
  { label: "明细", href: "/transactions" },
  { label: "统计", href: "/statistics" },
  { label: "设置", href: "/settings" },
];

type AppShellProps = {
  currentLedgerName: string | null;
  email: string;
  children: ReactNode;
};

export function AppShell({
  currentLedgerName,
  email,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const isBottomNavSelected = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <UserThemeProvider storageScope={email}>
      <Box
        sx={{
          minHeight: "100vh",
          overflow: "hidden",
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
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.58)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.76)",
            color: "var(--user-theme-status-text)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <Toolbar sx={{ gap: 2, py: 1.5 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", flexGrow: 1, width: "100%" }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  component={Link}
                  href="/dashboard"
                  variant="h6"
                  sx={{
                    background: "var(--user-theme-title-gradient)",
                    backgroundClip: "text",
                    color: "transparent",
                    fontWeight: 700,
                    textDecoration: "none",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  UchiLog
                </Typography>

                <Typography
                  component={Link}
                  href={currentLedgerName ? "/ledgers" : "/ledger-setup"}
                  sx={{
                    color: "var(--user-theme-subtitle-text)",
                    display: "block",
                    mt: 0.5,
                    textDecoration: "none",
                  }}
                  variant="body2"
                >
                  {currentLedgerName
                    ? `当前账本：${currentLedgerName}`
                    : "还没有账本"}
                </Typography>
              </Box>

              <Typography
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
                variant="body2"
              >
                {email}
              </Typography>

              <Box component="form" action={logout}>
                <Button
                  type="submit"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.86)",
                    bgcolor: "rgba(255, 255, 255, 0.46)",
                    color: "var(--user-theme-section-text)",
                    whiteSpace: "nowrap",
                  }}
                >
                  登出
                </Button>
              </Box>
            </Stack>
          </Toolbar>
        </AppBar>

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
                  bgcolor: "transparent",
                  background: "var(--user-theme-fab-bg)",
                  borderRadius: "50%",
                  boxShadow: "0 4px 16px var(--user-theme-fab-shadow)",
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 500,
                  height: 48,
                  lineHeight: 1,
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
                +
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
