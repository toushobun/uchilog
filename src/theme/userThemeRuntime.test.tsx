import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { UserThemePicker } from "molecules/theme/UserThemePicker";
import { UserThemeProvider } from "./UserThemeProvider";
import { getUserThemeStorageKey } from "./userThemeStorage";

describe("user theme runtime", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-user-theme");
    document.documentElement.removeAttribute("style");
  });

  it("退出登录卸载 protected provider 时会恢复默认主题背景", async () => {
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

    document.documentElement.dataset.userTheme = "sakura_story";

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
