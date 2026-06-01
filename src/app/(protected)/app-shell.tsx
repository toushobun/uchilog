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

import { logout } from "./actions";

const navItems = [
  { label: "首页", href: "/dashboard" },
  { label: "记账", href: "/transactions" },
  { label: "账户", href: "/accounts" },
  { label: "分类", href: "/categories" },
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

  return (
    <Box sx={{ minHeight: "100vh", pb: 10 }}>
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              component={Link}
              href="/dashboard"
              variant="h6"
              sx={{
                color: "inherit",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              UchiLog
            </Typography>

            <Typography
              component={Link}
              href={currentLedgerName ? "/ledgers" : "/ledger-setup"}
              color="text.secondary"
              sx={{
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
            <Button type="submit" variant="outlined" size="small">
              登出
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 0,
          bottom: 0,
          left: 0,
          position: "fixed",
          right: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="md">
          <Stack
            component="nav"
            direction="row"
            sx={{ justifyContent: "space-around", py: 1 }}
          >
            {navItems.map((item) => {
              const selected = pathname === item.href;

              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  size="small"
                  variant={selected ? "contained" : "text"}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Container>
      </Paper>
    </Box>
  );
}
