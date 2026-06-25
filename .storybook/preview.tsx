import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Preview } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

import { defaultUserThemeCssVariables } from "../src/theme/userThemeCssVariables";
import { theme } from "../src/theme/theme";

const preview: Preview = {
  decorators: [
    (Story): ReactNode => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={defaultUserThemeCssVariables as CSSProperties}>
          <Story />
        </div>
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
