import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

import { UserThemePicker } from "molecules/theme/UserThemePicker";
import { UserThemeProvider } from "./UserThemeProvider";
import {
  getUserThemeStorageKey,
  userThemeCookieName,
} from "./userThemeStorage";

describe("user theme runtime", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState(null, "", "/");
    document.cookie = `${userThemeCookieName}=; path=/; max-age=0; samesite=lax`;
    document.documentElement.removeAttribute("data-user-theme");
    document.documentElement.removeAttribute("style");
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("退出登录卸载 protected provider 时会恢复默认主题背景", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "jade_morning_dew",
    );

    document.documentElement.dataset.userTheme = "jade_morning_dew";

    const { unmount } = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");
    expect(document.cookie).toContain(
      `${userThemeCookieName}=jade_morning_dew`,
    );

    unmount();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
    expect(document.cookie).not.toContain(userThemeCookieName);
    expect(
      document.documentElement.style.getPropertyValue("--user-theme-page-bg"),
    ).toContain("#b8f0e0");
  });

  it("protected provider 重新挂载时不会短暂恢复默认主题", () => {
    vi.useFakeTimers();
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "jade_morning_dew",
    );

    document.documentElement.dataset.userTheme = "jade_morning_dew";

    const firstRender = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    firstRender.unmount();

    const secondRender = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");

    // 清理第二次挂载，并触发延迟的默认主题重置。
    secondRender.unmount();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
  });

  it("Suspense 延迟重挂载到下一轮任务时不会恢复默认主题", () => {
    vi.useFakeTimers();
    window.history.pushState(null, "", "/statistics?month=2026-06");
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "jade_morning_dew",
    );

    document.documentElement.dataset.userTheme = "jade_morning_dew";

    const firstRender = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    firstRender.unmount();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");
    expect(document.cookie).toContain(
      `${userThemeCookieName}=jade_morning_dew`,
    );

    const secondRender = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");

    secondRender.unmount();
    window.history.pushState(null, "", "/login");

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
    expect(document.cookie).not.toContain(userThemeCookieName);
  });

  it("主题选择器刷新后选中当前用户保存的主题，而不是先显示默认主题", async () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "sakura_story",
    );

    document.documentElement.dataset.userTheme = "sakura_story";

    const initialMarkup = renderToString(
      <UserThemeProvider storageScope="a@example.com">
        <UserThemePicker />
      </UserThemeProvider>,
    );

    expect(initialMarkup).toContain('aria-hidden="true"');

    const { findByRole, getByRole, unmount } = render(
      <UserThemeProvider storageScope="a@example.com">
        <UserThemePicker />
      </UserThemeProvider>,
    );

    const sakuraOption = await findByRole("option", {
      name: "切换到粉樱物语",
    });

    expect(sakuraOption.getAttribute("aria-selected")).toBe("true");
    expect(
      getByRole("option", { name: "切换到薰衣草梦境" }).getAttribute(
        "aria-selected",
      ),
    ).toBe("false");

    vi.useFakeTimers();
    unmount();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
  });
});
