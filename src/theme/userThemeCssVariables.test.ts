import { describe, expect, it } from "vitest";

import { userThemeKeys } from "./userThemeTokens";
import { getUserThemeCssVariables } from "./userThemeCssVariables";

describe("getUserThemeCssVariables", () => {
  it("输出薰衣草梦境的交易相关用户主题变量", () => {
    const themeVars = getUserThemeCssVariables("lavenderDream");

    expect(themeVars["--user-theme-tx-summary-bg"]).toBe("#F1ECFA");
    expect(themeVars["--user-theme-tx-nav-bg"]).toBe("#F1ECFA");
    expect(themeVars["--user-theme-tx-avatar-bg"]).toBe("#EEE8F8");
    expect(themeVars["--user-theme-tx-accent"]).toBe("#8A72CC");
    expect(themeVars["--user-theme-tx-border"]).toBe(
      "rgba(185, 171, 210, 0.42)",
    );
  });

  it("输出默认主题琥珀暖阳的交易相关用户主题变量", () => {
    const themeVars = getUserThemeCssVariables("amberWarmth");

    expect(themeVars["--user-theme-tx-summary-bg"]).toBe("#F7EFE5");
    expect(themeVars["--user-theme-tx-nav-bg"]).toBe("#F7EFE5");
    expect(themeVars["--user-theme-tx-avatar-bg"]).toBe("#FEF3DC");
    expect(themeVars["--user-theme-tx-accent"]).toBe("#E8930A");
    expect(themeVars["--user-theme-tx-border"]).toBe(
      "rgba(200, 185, 168, 0.45)",
    );
  });

  it("输出深海星光的交易相关用户主题变量", () => {
    const themeVars = getUserThemeCssVariables("deepSeaStarlight");

    expect(themeVars["--user-theme-tx-summary-bg"]).toBe("#EAF2FA");
    expect(themeVars["--user-theme-tx-nav-bg"]).toBe("#EAF2FA");
    expect(themeVars["--user-theme-tx-avatar-bg"]).toBe("#E6F1FB");
    expect(themeVars["--user-theme-tx-accent"]).toBe("#4A90D9");
    expect(themeVars["--user-theme-tx-border"]).toBe(
      "rgba(164, 187, 210, 0.42)",
    );
  });

  it("所有主题均输出白色 FAB 文字色变量", () => {
    expect(
      getUserThemeCssVariables("amberWarmth")["--user-theme-fab-text"],
    ).toBe("#FFFFFF");
    expect(
      getUserThemeCssVariables("lavenderDream")["--user-theme-fab-text"],
    ).toBe("#FFFFFF");
    expect(
      getUserThemeCssVariables("deepSeaStarlight")["--user-theme-fab-text"],
    ).toBe("#FFFFFF");
  });

  it("输出共通样式组件使用的用户主题变量", () => {
    const themeVars = getUserThemeCssVariables("amberWarmth");

    expect(themeVars["--user-theme-segment-bg"]).toBe("#F7EFE5");
    expect(themeVars["--user-theme-segment-selected-bg"]).toBe("#FFFDF8");
    expect(themeVars["--user-theme-icon-badge-bg"]).toBe("#FEF3DC");
    expect(themeVars["--user-theme-receipt-bg"]).toBe("#FFFDF8");
    expect(themeVars["--user-theme-receipt-tear-bg"]).toBe("#FDF8F0");
    expect(themeVars["--user-theme-business-pending-bg"]).toBe("#FFF3D6");
    expect(themeVars["--user-theme-business-completed-text"]).toBe("#2F855A");
  });

  it("输出默认主题首页金额语义色变量", () => {
    const themeVars = getUserThemeCssVariables("amberWarmth");

    expect(themeVars["--user-theme-income-amount"]).toBe("#42A87A");
    expect(themeVars["--user-theme-negative-amount"]).toBe("#E8547A");
  });

  it("输出默认主题交易类型背景语义色变量", () => {
    const themeVars = getUserThemeCssVariables("amberWarmth");

    expect(themeVars["--user-theme-income-bg"]).toBe("#E8F5F0");
    expect(themeVars["--user-theme-transfer-bg"]).toBe("#E4F0FA");
    expect(themeVars["--user-theme-negative-bg"]).toBe("#FDE8EE");
  });

  it("所有主题均输出首页金额相关变量", () => {
    userThemeKeys.forEach((themeKey) => {
      const themeVars = getUserThemeCssVariables(themeKey);

      expect(themeVars["--user-theme-income-amount"]).toEqual(
        expect.any(String),
      );
      expect(themeVars["--user-theme-negative-amount"]).toEqual(
        expect.any(String),
      );
    });
  });

  it("所有主题均输出交易类型背景相关变量", () => {
    userThemeKeys.forEach((themeKey) => {
      const themeVars = getUserThemeCssVariables(themeKey);

      expect(themeVars["--user-theme-income-bg"]).toEqual(expect.any(String));
      expect(themeVars["--user-theme-transfer-bg"]).toEqual(expect.any(String));
      expect(themeVars["--user-theme-negative-bg"]).toEqual(expect.any(String));
    });
  });
});
