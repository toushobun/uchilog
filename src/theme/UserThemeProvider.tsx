"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { routePaths } from "config/paths";
import { getUserThemeCssVariables } from "theme/userThemeCssVariables";
import {
  defaultUserThemeKey,
  isUserThemeKey,
  type UserThemeKey,
  userThemeKeys,
  userThemeTokens,
} from "theme/userThemeTokens";
import {
  getUserThemeStorageKey,
  lastUserThemeStorageKey,
  userThemeChangeEventName,
  userThemeCookieName,
} from "theme/userThemeStorage";

type UserThemeContextValue = {
  isThemeReady: boolean;
  themeKey: UserThemeKey;
  setThemeKey: (themeKey: UserThemeKey) => void;
  themeKeys: typeof userThemeKeys;
  tokens: typeof userThemeTokens;
};

const UserThemeContext = createContext<UserThemeContextValue | null>(null);

// 仅列出 protected layout 下的入口路由；home("/") / login("/login") 等公开路由有意排除。
const protectedRoutePrefixes = [
  routePaths.accounts,
  routePaths.categories,
  routePaths.dashboard,
  routePaths.ledgerSetup,
  routePaths.ledgers,
  routePaths.merchants,
  routePaths.settings,
  routePaths.statistics,
  routePaths.transactions,
] as const;

// AppShell 同一时刻只会挂载一个用户主题 provider；这个共享槽用于跨过 React 卸载/重挂载间隙。
// Suspense 或懒加载可能让新 provider 晚于下一轮任务挂载，所以执行重置前还要确认当前路径已经离开 protected 区域。
let pendingDefaultThemeResetId: number | null = null;

type UserThemeProviderProps = {
  children: ReactNode;
  storageScope?: string;
};

export function UserThemeProvider({
  children,
  storageScope = "anonymous",
}: UserThemeProviderProps) {
  const storageKey = getUserThemeStorageKey(storageScope);
  const themeKey = useSyncExternalStore(
    subscribeToUserTheme,
    () => getStoredUserThemeKey(storageKey),
    getDefaultUserThemeKey,
  );
  const isThemeReady = useSyncExternalStore(
    subscribeToUserTheme,
    () => getIsThemeReady(storageKey),
    () => false,
  );
  const appliedThemeKey = getAppliedUserThemeKey();
  const visibleThemeKey =
    isThemeReady && appliedThemeKey ? appliedThemeKey : themeKey;

  useEffect(() => {
    cancelDefaultUserThemeReset();

    return () => {
      scheduleDefaultUserThemeReset();
    };
  }, []);

  useEffect(() => {
    const storedThemeKey = getStoredUserThemeKey(storageKey);

    applyUserTheme(storedThemeKey);
    syncThemeCookie(storedThemeKey);
    window.dispatchEvent(new Event(userThemeChangeEventName));
  }, [storageKey, themeKey]);

  const setThemeKey = useCallback(
    (nextThemeKey: UserThemeKey) => {
      window.localStorage.setItem(storageKey, nextThemeKey);
      window.localStorage.setItem(lastUserThemeStorageKey, nextThemeKey);
      applyUserTheme(nextThemeKey);
      syncThemeCookie(nextThemeKey);
      window.dispatchEvent(new Event(userThemeChangeEventName));
    },
    [storageKey],
  );

  const value = useMemo(
    () => ({
      isThemeReady,
      themeKey: visibleThemeKey,
      setThemeKey,
      themeKeys: userThemeKeys,
      tokens: userThemeTokens,
    }),
    [isThemeReady, setThemeKey, visibleThemeKey],
  );

  return (
    <UserThemeContext.Provider value={value}>
      {children}
    </UserThemeContext.Provider>
  );
}

export function useUserTheme() {
  const context = useContext(UserThemeContext);

  if (!context) {
    throw new Error("useUserTheme must be used inside UserThemeProvider");
  }

  return context;
}

function syncThemeCookie(themeKey: UserThemeKey) {
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `${userThemeCookieName}=${themeKey}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearThemeCookie() {
  document.cookie = `${userThemeCookieName}=; path=/; max-age=0; samesite=lax`;
}

function applyUserTheme(themeKey: UserThemeKey) {
  const root = document.documentElement;
  const cssVariables = getUserThemeCssVariables(themeKey);

  root.setAttribute("data-user-theme", themeKey);

  Object.entries(cssVariables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

function cancelDefaultUserThemeReset() {
  if (pendingDefaultThemeResetId === null) {
    return;
  }

  window.clearTimeout(pendingDefaultThemeResetId);
  pendingDefaultThemeResetId = null;
}

function scheduleDefaultUserThemeReset() {
  if (pendingDefaultThemeResetId !== null) {
    return;
  }

  pendingDefaultThemeResetId = window.setTimeout(() => {
    pendingDefaultThemeResetId = null;

    if (isCurrentPathProtectedRoute()) {
      return;
    }

    applyUserTheme(defaultUserThemeKey);
    clearThemeCookie();
  }, 0);
}

function isCurrentPathProtectedRoute() {
  const { pathname } = window.location;

  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function subscribeToUserTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(userThemeChangeEventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(userThemeChangeEventName, onStoreChange);
  };
}

function getStoredUserThemeKey(storageKey: string): UserThemeKey {
  const savedThemeKey = normalizeUserThemeKey(
    window.localStorage.getItem(storageKey),
  );

  if (savedThemeKey) {
    return savedThemeKey;
  }

  const lastThemeKey = normalizeUserThemeKey(
    window.localStorage.getItem(lastUserThemeStorageKey),
  );

  return lastThemeKey ?? defaultUserThemeKey;
}

function normalizeUserThemeKey(value: string | null): UserThemeKey | null {
  if (!value) {
    return null;
  }

  if (isUserThemeKey(value)) {
    return value;
  }

  return null;
}

function getDefaultUserThemeKey(): UserThemeKey {
  return defaultUserThemeKey;
}

function getAppliedUserThemeKey(): UserThemeKey | null {
  if (typeof document === "undefined") {
    return null;
  }

  const themeKey = document.documentElement.dataset.userTheme;

  return themeKey ? normalizeUserThemeKey(themeKey) : null;
}

function getIsThemeReady(storageKey: string) {
  return getAppliedUserThemeKey() === getStoredUserThemeKey(storageKey);
}
