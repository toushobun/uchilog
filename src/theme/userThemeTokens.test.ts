import { describe, expect, it } from "vitest";

import {
  defaultUserThemeKey,
  isUserThemeKey,
  userThemeKeys,
  userThemeTokens,
} from "./userThemeTokens";
import { getUserThemeStorageKey } from "./userThemeStorage";
import { themeColorKeys } from "./themeColorTokens";

describe("userThemeTokens", () => {
  it("默认主题使用 issue 54 指定的薰衣草梦境", () => {
    expect(defaultUserThemeKey).toBe("lavender_dream");
    expect(userThemeTokens[defaultUserThemeKey].label).toBe("薰衣草梦境");
  });

  it("包含 issue 54 第一阶段的 10 个浅色个人主题", () => {
    expect(userThemeKeys).toEqual([
      "lavender_dream",
      "jade_morning_dew",
      "sakura_story",
      "deep_sea_starlight",
      "amber_sun",
      "rose_velvet_night",
      "flame_red",
      "lemon_gold",
      "indigo_ocean",
      "white_porcelain",
    ]);

    expect(userThemeKeys).toHaveLength(10);
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
    expect(isUserThemeKey("sakura_story")).toBe(true);
    expect(isUserThemeKey("sakura")).toBe(false);
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
});
