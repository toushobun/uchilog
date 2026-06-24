export const legacyUserThemeStorageKey = "kuranote-user-theme";
export const lastUserThemeStorageKey = "kuranote-user-theme:last";
const userThemeStorageKeyPrefix = "kuranote-user-theme";
export const userThemeScopedStorageKeyPrefix = `${userThemeStorageKeyPrefix}:user:`;
export const userThemeChangeEventName = "kuranote-user-theme-change";
export const userThemeCookieName = "kuranote-user-theme-key";

export function getUserThemeStorageKey(storageScope: string) {
  return `${userThemeScopedStorageKeyPrefix}${encodeURIComponent(
    storageScope.trim().toLowerCase(),
  )}`;
}
