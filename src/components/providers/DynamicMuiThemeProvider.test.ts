import { describe, expect, it } from "vitest";

import { theme as baseTheme } from "theme/theme";
import { userThemeKeys, userThemeTokens } from "theme/userThemeTokens";
import { createDynamicMuiTheme } from "./DynamicMuiThemeProvider";

function expectOverlayPaperBackground(override: unknown) {
  expect(override).toMatchObject({
    backgroundColor: baseTheme.palette.background.paper,
  });
}

describe("createDynamicMuiTheme", () => {
  it("会将用户卡片色写入 MUI background.paper", () => {
    userThemeKeys.forEach((themeKey) => {
      const token = userThemeTokens[themeKey];
      const dynamicTheme = createDynamicMuiTheme(themeKey);

      expect(dynamicTheme.palette.background.paper).toBe(token.palette.card);
    });
  });

  it("只让确认过的基础 palette 跟随用户主题", () => {
    userThemeKeys.forEach((themeKey) => {
      const token = userThemeTokens[themeKey];
      const dynamicTheme = createDynamicMuiTheme(themeKey);

      expect(dynamicTheme.palette.primary.main).toBe(token.palette.accent);
      expect(dynamicTheme.palette.primary.light).toBe(
        token.palette.accentLight,
      );
      expect(dynamicTheme.palette.primary.dark).toBe(token.palette.accentDeep);
      expect(dynamicTheme.palette.background.default).toBe(token.palette.page);
      expect(dynamicTheme.palette.text.primary).toBe(token.palette.text);
      expect(dynamicTheme.palette.text.secondary).toBe(token.palette.textMuted);
      expect(dynamicTheme.palette.divider).toBe(token.palette.divider);
    });
  });

  it("会将 overlay 组件背景固定为基础 paper", () => {
    const dynamicTheme = createDynamicMuiTheme(userThemeKeys[0]);

    expectOverlayPaperBackground(
      dynamicTheme.components?.MuiDialog?.styleOverrides?.paper,
    );
    expectOverlayPaperBackground(
      dynamicTheme.components?.MuiDrawer?.styleOverrides?.paper,
    );
    expectOverlayPaperBackground(
      dynamicTheme.components?.MuiMenu?.styleOverrides?.paper,
    );
    expectOverlayPaperBackground(
      dynamicTheme.components?.MuiPopover?.styleOverrides?.paper,
    );
  });
});
