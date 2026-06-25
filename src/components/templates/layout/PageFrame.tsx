import Box from "@mui/material/Box";
import Container, { type ContainerProps } from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import type { ReactNode } from "react";

import { designTokens } from "theme/theme";

type PageFrameProps = {
  bottomNavigationOffset?: boolean;
  children: ReactNode;
  maxWidth?: ContainerProps["maxWidth"];
};

export function PageFrame({
  bottomNavigationOffset = false,
  children,
  maxWidth = "md",
}: PageFrameProps) {
  return (
    <Box
      sx={{
        background: "var(--user-theme-page-bg)",
        color: "var(--user-theme-balance-text)",
        minHeight: "100dvh",
        overflowX: "hidden",
      }}
    >
      <Container
        component="main"
        maxWidth={maxWidth}
        sx={{
          px: {
            xs: designTokens.spacing.page.mobile,
            sm: designTokens.spacing.page.desktop,
          },
          py: {
            xs: designTokens.spacing.page.mobile,
            sm: designTokens.spacing.page.desktop,
          },
          pb: bottomNavigationOffset
            ? 12
            : {
                xs: designTokens.spacing.page.mobile,
                sm: designTokens.spacing.page.desktop,
              },
        }}
      >
        <Stack spacing={{ xs: 3, sm: 4 }}>{children}</Stack>
      </Container>
    </Box>
  );
}
