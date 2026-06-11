"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import type { ReactNode } from "react";

import { DynamicMuiThemeProvider } from "providers/DynamicMuiThemeProvider";
import { BottomNavigationBar } from "organisms/navigation/BottomNavigationBar";
import { UserThemeProvider } from "theme/UserThemeProvider";

type AppShellProps = {
  children: ReactNode;
  email: string;
};

export function AppShell({ children, email }: AppShellProps) {
  return (
    <UserThemeProvider storageScope={email}>
      <DynamicMuiThemeProvider>
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

          <BottomNavigationBar />
        </Box>
      </DynamicMuiThemeProvider>
    </UserThemeProvider>
  );
}
