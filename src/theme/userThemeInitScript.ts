import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import {
  defaultUserThemeKey,
  type UserThemeKey,
  userThemeKeys,
} from "theme/userThemeTokens";
import {
  getUserThemeStorageKey,
  lastUserThemeStorageKey,
  legacyUserThemeStorageKey,
} from "theme/userThemeStorage";

const userThemeCssVariablesByKey = Object.fromEntries(
  userThemeKeys.map((themeKey) => [
    themeKey,
    getUserThemeCssVariables(themeKey),
  ]),
) as Record<UserThemeKey, ReturnType<typeof getUserThemeCssVariables>>;

function createApplyThemeScriptBody({
  scopedStorageKey,
}: {
  scopedStorageKey?: string;
}) {
  return `
    (() => {
      const scopedStorageKey = ${JSON.stringify(scopedStorageKey ?? null)};
      const lastStorageKey = ${JSON.stringify(lastUserThemeStorageKey)};
      const legacyStorageKey = ${JSON.stringify(legacyUserThemeStorageKey)};
      const defaultThemeKey = ${JSON.stringify(defaultUserThemeKey)};
      const cssVariablesByThemeKey = ${JSON.stringify(userThemeCssVariablesByKey)};

      try {
        const scopedThemeKey = scopedStorageKey
          ? window.localStorage.getItem(scopedStorageKey)
          : null;
        const lastThemeKey = window.localStorage.getItem(lastStorageKey);
        const legacyThemeKey = window.localStorage.getItem(legacyStorageKey);
        const themeKey = cssVariablesByThemeKey[scopedThemeKey]
          ? scopedThemeKey
          : cssVariablesByThemeKey[lastThemeKey]
            ? lastThemeKey
            : cssVariablesByThemeKey[legacyThemeKey]
              ? legacyThemeKey
              : defaultThemeKey;
        const cssVariables = cssVariablesByThemeKey[themeKey];
        const root = document.documentElement;

        root.setAttribute("data-user-theme", themeKey);

        Object.entries(cssVariables).forEach(([name, value]) => {
          root.style.setProperty(name, value);
        });
      } catch {
        document.documentElement.setAttribute("data-user-theme", defaultThemeKey);
      }
    })();
  `;
}

export function createLastUserThemeInitScript() {
  return createApplyThemeScriptBody({});
}

export function createUserThemeInitScript(storageScope: string) {
  return createApplyThemeScriptBody({
    scopedStorageKey: getUserThemeStorageKey(storageScope),
  });
}
