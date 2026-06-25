import { describe, expect, it } from "vitest";

import {
  createAlphaColor,
  defaultUserThemeKey,
  isUserThemeKey,
  userThemeKeys,
  userThemeTokens,
} from "./userThemeTokens";
import { getUserThemeStorageKey } from "./userThemeStorage";
import { themeColorKeys } from "./themeColorTokens";

const criticalSemanticKeys = [
  "income",
  "expense",
  "transfer",
  "warning",
  "success",
] as const;

const criticalSemanticBgKeys = [
  "incomeBg",
  "expenseBg",
  "transferBg",
  "warningBg",
  "successBg",
] as const;

describe("userThemeTokens", () => {
  it("默认主题为琥珀暖阳", () => {
    expect(defaultUserThemeKey).toBe("amberWarmth");
    expect(userThemeTokens[defaultUserThemeKey].name).toBe("琥珀暖阳");
  });

  it("包含 6 款浅色个人主题", () => {
    expect(userThemeKeys).toEqual([
      "amberWarmth",
      "lavenderDream",
      "emeraldMorning",
      "sakuraStory",
      "deepSeaStarlight",
      "flameRed",
    ]);

    expect(userThemeKeys).toHaveLength(6);
    expect(
      userThemeKeys.every((key) => userThemeTokens[key].mode === "light"),
    ).toBe(true);
  });

  it("和账本成员显示色 key 分离，避免混用业务颜色", () => {
    const memberDisplayColorKeys = new Set<string>(themeColorKeys);

    expect(userThemeKeys.some((key) => memberDisplayColorKeys.has(key))).toBe(
      false,
    );
  });

  it("可以校验 localStorage 里保存的主题 key", () => {
    expect(isUserThemeKey("sakuraStory")).toBe(true);
    expect(isUserThemeKey("sakura_story")).toBe(false);
  });

  it("按登录用户生成不同 localStorage key，避免用户主题互相影响", () => {
    expect(getUserThemeStorageKey("a@example.com")).toBe(
      "kuranote-user-theme:user:a%40example.com",
    );
    expect(getUserThemeStorageKey("B@example.com")).toBe(
      "kuranote-user-theme:user:b%40example.com",
    );
    expect(getUserThemeStorageKey("a@example.com")).not.toBe(
      getUserThemeStorageKey("b@example.com"),
    );
  });

  it("根据 base palette 派生缺省字段", () => {
    userThemeKeys.forEach((themeKey) => {
      const token = userThemeTokens[themeKey];

      expect(token.palette.cardElevated).toBe(token.palette.card);
      expect(token.palette.divider).toBe(token.palette.border);
      expect(token.palette.accentSoft).toBe(token.palette.accentPale);
      expect(token.palette.shadow).not.toContain("rgba(#");
      expect(token.component.buttonSecondaryBg).toBe(token.palette.accentPale);
      expect(token.component.iconBadgeBg).toBe(token.palette.accentPale);
      expect(token.illustration.mascotAccent).toBe(token.palette.accent);
    });
  });

  it("透明色派生支持 3 位和 6 位 hex", () => {
    expect(createAlphaColor("#fff", 0.5)).toBe("rgba(255, 255, 255, 0.5)");
    expect(createAlphaColor("#3D2E22", 0.08)).toBe("rgba(61, 46, 34, 0.08)");
  });

  it("透明色派生遇到非法颜色时抛出错误", () => {
    expect(() => createAlphaColor("rgba(255, 255, 255, 0.5)", 0.5)).toThrow(
      "Invalid hex color",
    );
    expect(() => createAlphaColor("#ffff", 0.5)).toThrow("Invalid hex color");
  });

  it("主题 accent 不与关键语义色完全相同", () => {
    userThemeKeys.forEach((themeKey) => {
      const token = userThemeTokens[themeKey];
      const semanticColors = criticalSemanticKeys.map(
        (semanticKey) => token.semantic[semanticKey],
      );

      expect(semanticColors).not.toContain(token.palette.accent);
    });
  });

  it("主题浅背景不与关键语义背景完全相同", () => {
    userThemeKeys.forEach((themeKey) => {
      const token = userThemeTokens[themeKey];
      const semanticBackgrounds = criticalSemanticBgKeys.map(
        (semanticKey) => token.semantic[semanticKey],
      );

      expect(semanticBackgrounds).not.toContain(token.palette.accentPale);
      expect(semanticBackgrounds).not.toContain(token.palette.accentSoft);
    });
  });
});
