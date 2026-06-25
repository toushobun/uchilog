import { describe, expect, it } from "vitest";

import { theme as baseTheme } from "theme/theme";
import {
  defaultUserThemeKey,
  userThemeKeys,
  userThemeTokens,
} from "theme/userThemeTokens";
import { createDynamicMuiTheme } from "./DynamicMuiThemeProvider";

describe("createDynamicMuiTheme", () => {
  it("不会将用户卡片色写入 MUI background.paper", () => {
    userThemeKeys.forEach((themeKey) => {
      const dynamicTheme = createDynamicMuiTheme(themeKey);

      expect(dynamicTheme.palette.background.paper).toBe(
        baseTheme.palette.background.paper,
      );
    });
  });

  it("只让确认过的基础 palette 跟随用户主题", () => {
    const token = userThemeTokens[defaultUserThemeKey];
    const dynamicTheme = createDynamicMuiTheme(defaultUserThemeKey);

    expect(dynamicTheme.palette.primary.main).toBe(token.palette.accent);
    expect(dynamicTheme.palette.primary.light).toBe(token.palette.accentLight);
    expect(dynamicTheme.palette.primary.dark).toBe(token.palette.accentDeep);
    expect(dynamicTheme.palette.background.default).toBe(token.palette.page);
    expect(dynamicTheme.palette.text.primary).toBe(token.palette.text);
    expect(dynamicTheme.palette.text.secondary).toBe(token.palette.textMuted);
    expect(dynamicTheme.palette.divider).toBe(token.palette.divider);
  });
});
