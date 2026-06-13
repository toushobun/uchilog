"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { bottomNavigationRouteGroups, routePaths } from "config/paths";
import { BottomNavButton } from "molecules/navigation/BottomNavButton";

const transactionEditPathPattern = /^\/transactions\/[^/]+\/edit$/;

export function BottomNavigationBar() {
  const pathname = usePathname();
  const isTransactionFormPage =
    pathname === routePaths.transactionsNew ||
    transactionEditPathPattern.test(pathname);
  const isBottomNavSelected = (href: string) =>
    !isTransactionFormPage &&
    (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <Paper
      elevation={0}
      sx={{
        backdropFilter: "blur(20px)",
        bgcolor: "var(--user-theme-nav-bg)",
        borderRadius: 0,
        borderTop: "1px solid var(--user-theme-nav-border)",
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
          {bottomNavigationRouteGroups.left.map((route) => (
            <BottomNavButton
              href={route.href}
              key={route.href}
              label={route.label}
              selected={isBottomNavSelected(route.href)}
            />
          ))}
          <Button
            aria-label="新增记录"
            component={Link}
            href={routePaths.transactionsNew}
            variant="text"
            sx={{
              alignItems: "center",
              background: "var(--user-theme-fab-bg)",
              bgcolor: "transparent",
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
                background: "var(--user-theme-fab-bg)",
                bgcolor: "transparent",
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
          {bottomNavigationRouteGroups.right.map((route) => (
            <BottomNavButton
              href={route.href}
              key={route.href}
              label={route.label}
              selected={isBottomNavSelected(route.href)}
            />
          ))}
        </Stack>
      </Container>
    </Paper>
  );
}
