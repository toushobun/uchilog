export const lastUserThemeStorageKey = "kuranote-user-theme:last";
export const userThemeScopedStorageKeyPrefix = "kuranote-user-theme:user:";
export const userThemeChangeEventName = "kuranote-user-theme-change";
export const userThemeCookieName = "kuranote-user-theme-key";

export function getUserThemeStorageKey(storageScope: string) {
  return `${userThemeScopedStorageKeyPrefix}${encodeURIComponent(
    storageScope.trim().toLowerCase(),
  )}`;
}
