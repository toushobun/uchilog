export const legacyUserThemeStorageKey = "uchilog-user-theme";
export const lastUserThemeStorageKey = "uchilog-user-theme:last";
const userThemeStorageKeyPrefix = "uchilog-user-theme";
export const userThemeScopedStorageKeyPrefix = `${userThemeStorageKeyPrefix}:user:`;
export const userThemeChangeEventName = "uchilog-user-theme-change";

export function getUserThemeStorageKey(storageScope: string) {
  return `${userThemeScopedStorageKeyPrefix}${encodeURIComponent(
    storageScope.trim().toLowerCase(),
  )}`;
}
