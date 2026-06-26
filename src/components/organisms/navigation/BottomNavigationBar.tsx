"use client";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { KuraIcon, type KuraIconName } from "atoms/icons";
import { bottomNavigationRouteGroups, routePaths } from "config/paths";
import { BottomNavButton } from "molecules/navigation/BottomNavButton";

const transactionEditPathPattern = /^\/transactions\/[^/]+\/edit$/;

const bottomNavigationIconNames = {
  [routePaths.dashboard]: "home",
  [routePaths.settings]: "settings",
  [routePaths.statistics]: "statistics",
  [routePaths.transactions]: "transactions",
} as const satisfies Record<string, KuraIconName>;

const quickRecordIconSx = {
  bottom: "6px",
  left: "50%",
  pointerEvents: "none",
  position: "absolute",
  transform: "translateX(-50%)",
} as const;

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
        boxShadow: "0 -8px 24px var(--user-theme-fab-shadow)",
        left: 0,
        overflow: "visible",
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
            overflow: "visible",
            py: 0.75,
          }}
        >
          {bottomNavigationRouteGroups.left.map((route) => (
            <BottomNavButton
              href={route.href}
              icon={
                <KuraIcon
                  decorative
                  name={bottomNavigationIconNames[route.href]}
                  size="sm"
                />
              }
              key={route.href}
              label={route.label}
              selected={isBottomNavSelected(route.href)}
            />
          ))}
          <Button
            aria-label="新增记录"
            component={Link}
            disableFocusRipple
            disableRipple
            href={routePaths.transactionsNew}
            variant="text"
            sx={{
              WebkitTapHighlightColor: "transparent",
              alignItems: "center",
              bgcolor: "transparent",
              borderRadius: 0,
              boxShadow: "none",
              display: "inline-flex",
              height: 56,
              justifyContent: "center",
              minWidth: 0,
              overflow: "visible",
              p: 0,
              position: "relative",
              width: 56,
              "& .MuiTouchRipple-root": {
                display: "none",
              },
              "&:active, &:focus, &:focus-visible, &:hover": {
                bgcolor: "transparent",
                boxShadow: "none",
                filter: "brightness(1.04)",
                outline: "none",
              },
            }}
          >
            <KuraIcon
              decorative
              name="quickRecord"
              size={70}
              sx={quickRecordIconSx}
            />
          </Button>
          {bottomNavigationRouteGroups.right.map((route) => (
            <BottomNavButton
              href={route.href}
              icon={
                <KuraIcon
                  decorative
                  name={bottomNavigationIconNames[route.href]}
                  size="sm"
                />
              }
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
