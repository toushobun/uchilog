import { beforeEach, describe, expect, it } from "vitest";

import { createUserThemeBootstrapScript } from "./userThemeBootstrapScript";
import {
  getUserThemeStorageKey,
  legacyUserThemeStorageKey,
} from "./userThemeStorage";

describe("createUserThemeBootstrapScript", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-user-theme");
    document.documentElement.removeAttribute("style");
  });

  it("hydrates the last selected user theme before React mounts", () => {
    window.localStorage.setItem("uchilog-user-theme:last", "jade_morning_dew");

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("jade_morning_dew");
    expect(
      document.documentElement.style.getPropertyValue("--user-theme-page-bg"),
    ).toContain("#d1fae5");
  });

  it("uses the anonymous scoped theme before the last fallback", () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("anonymous"),
      "sakura_story",
    );
    window.localStorage.setItem("uchilog-user-theme:last", "amber_sun");

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("sakura_story");
  });

  it("falls back to a single user-scoped theme when no last theme exists", () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "indigo_ocean",
    );

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("indigo_ocean");
  });

  it("uses the legacy theme key when newer keys are absent", () => {
    window.localStorage.setItem(legacyUserThemeStorageKey, "amber_sun");

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("amber_sun");
  });

  it("keeps the default theme when multiple user-scoped themes exist", () => {
    window.localStorage.setItem(
      getUserThemeStorageKey("a@example.com"),
      "indigo_ocean",
    );
    window.localStorage.setItem(
      getUserThemeStorageKey("b@example.com"),
      "sakura_story",
    );

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
  });

  it("keeps the default theme when saved values are invalid", () => {
    window.localStorage.setItem("uchilog-user-theme:last", "not-a-theme");

    runBootstrapScript();

    expect(document.documentElement.dataset.userTheme).toBe("lavender_dream");
  });
});

function runBootstrapScript() {
  // 像浏览器一样执行生成出来的内联 bootstrap。
  Function(createUserThemeBootstrapScript())();
}
