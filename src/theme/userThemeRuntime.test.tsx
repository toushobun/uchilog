/**
 * @vitest-environment jsdom
 */

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { UserThemePicker } from "ui/UserThemePicker";
import { UserThemeProvider } from "./UserThemeProvider";
import { createUserThemeInitScript } from "./userThemeInitScript";
import { getUserThemeStorageKey } from "./userThemeStorage";

describe("user theme runtime", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-user-theme");
    document.documentElement.removeAttribute("style");
  });

  it("首屏脚本会按当前登录用户保存的主题设置背景", () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "jade_morning_dew",
    );
    window.localStorage.setItem(
      getUserThemeStorageKey("b@example.com"),
      "sakura_story",
    );

    runInitScript("a@example.com");

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");
    expect(
      document.documentElement.style.getPropertyValue("--user-theme-page-bg"),
    ).toContain("#fce7f3");

    runInitScript("b@example.com");

    expect(document.documentElement.dataset.userTheme).toBe("sakura_story");
    expect(
      document.documentElement.style.getPropertyValue("--user-theme-page-bg"),
    ).toContain("#fef9c3");
  });

  it("退出登录卸载 protected provider 时会恢复默认主题背景", async () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "jade_morning_dew",
    );

    runInitScript("a@example.com");

    const { unmount } = render(
      <UserThemeProvider storageScope="a@example.com">
        <div />
      </UserThemeProvider>,
    );

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");

    unmount();

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
    expect(
      document.documentElement.style.getPropertyValue("--user-theme-page-bg"),
    ).toContain("#b8f0e0");
  });

  it("主题选择器刷新后选中当前用户保存的主题，而不是先显示默认主题", async () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "sakura_story",
    );

    runInitScript("a@example.com");

    const initialMarkup = renderToString(
      <UserThemeProvider storageScope="a@example.com">
        <UserThemePicker />
      </UserThemeProvider>,
    );

    expect(initialMarkup).toContain('aria-hidden="true"');

    const { findByRole, getByRole } = render(
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
  });
});

function runInitScript(storageScope: string) {
  const script = createUserThemeInitScript(storageScope);

  window.eval(script);
}
