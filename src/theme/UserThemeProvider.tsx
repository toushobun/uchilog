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
  legacyUserThemeStorageKey,
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

// AppShell 同一时刻只会挂载一个用户主题 provider；这个共享槽只用于跨过同一次 React flush 内的卸载/重挂载间隙。
// 如果新路由异步加载到下一轮任务，延迟重置仍会执行，之后再由新 provider 应用已保存的主题。
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
    applyUserTheme(defaultUserThemeKey);
    clearThemeCookie();
  }, 0);
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
  const savedThemeKey = window.localStorage.getItem(storageKey);

  if (savedThemeKey && isUserThemeKey(savedThemeKey)) {
    return savedThemeKey;
  }

  const lastThemeKey = window.localStorage.getItem(lastUserThemeStorageKey);

  if (lastThemeKey && isUserThemeKey(lastThemeKey)) {
    return lastThemeKey;
  }

  const legacyThemeKey = window.localStorage.getItem(legacyUserThemeStorageKey);

  return legacyThemeKey && isUserThemeKey(legacyThemeKey)
    ? legacyThemeKey
    : defaultUserThemeKey;
}

function getDefaultUserThemeKey(): UserThemeKey {
  return defaultUserThemeKey;
}

function getAppliedUserThemeKey(): UserThemeKey | null {
  if (typeof document === "undefined") {
    return null;
  }

  const themeKey = document.documentElement.dataset.userTheme;

  return themeKey && isUserThemeKey(themeKey) ? themeKey : null;
}

function getIsThemeReady(storageKey: string) {
  return getAppliedUserThemeKey() === getStoredUserThemeKey(storageKey);
}
