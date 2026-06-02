import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Preview } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { theme } from "../src/theme/theme";

const preview: Preview = {
  decorators: [
    (Story): ReactNode => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
