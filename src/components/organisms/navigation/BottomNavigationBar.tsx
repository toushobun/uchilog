"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Link from "next/link";

import { bottomNavigationRoutes, routePaths } from "config/paths";
import { BottomNavButton } from "navigation-molecules/BottomNavButton";

type BottomNavigationBarProps = {
  pathname: string;
};

export function BottomNavigationBar({ pathname }: BottomNavigationBarProps) {
  const isCreateTransactionPage =
    pathname === routePaths.transactionsNew ||
    pathname.startsWith(`${routePaths.transactionsNew}/`);
  const isBottomNavSelected = (href: string) =>
    !isCreateTransactionPage &&
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
          <BottomNavButton
            href={bottomNavigationRoutes[0].href}
            label={bottomNavigationRoutes[0].label}
            selected={isBottomNavSelected(bottomNavigationRoutes[0].href)}
          />
          <BottomNavButton
            href={bottomNavigationRoutes[1].href}
            label={bottomNavigationRoutes[1].label}
            selected={isBottomNavSelected(bottomNavigationRoutes[1].href)}
          />
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
          <BottomNavButton
            href={bottomNavigationRoutes[2].href}
            label={bottomNavigationRoutes[2].label}
            selected={isBottomNavSelected(bottomNavigationRoutes[2].href)}
          />
          <BottomNavButton
            href={bottomNavigationRoutes[3].href}
            label={bottomNavigationRoutes[3].label}
            selected={isBottomNavSelected(bottomNavigationRoutes[3].href)}
          />
        </Stack>
      </Container>
    </Paper>
  );
}
