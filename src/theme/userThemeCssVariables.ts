import {
  defaultUserThemeKey,
  type UserThemeKey,
  userThemeTokens,
} from "./userThemeTokens";
import { userTransactionThemeTokens } from "./userTransactionThemeTokens";

const sharedUserThemeCssVariables = {
  "--user-theme-card-bg": "rgba(255, 255, 255, 0.54)",
  "--user-theme-card-border": "rgba(255, 255, 255, 0.75)",
  "--user-theme-card-shadow": "0 3px 18px rgba(0, 0, 0, 0.07)",
  "--user-theme-nav-bg": "rgba(255, 255, 255, 0.65)",
  "--user-theme-nav-border": "rgba(255, 255, 255, 0.82)",
} as const;

export function getUserThemeCssVariables(themeKey: UserThemeKey) {
  const tokens = userThemeTokens[themeKey];
  const transactionTokens = userTransactionThemeTokens[themeKey];

  return {
    ...sharedUserThemeCssVariables,
    "--user-theme-page-bg": tokens.pageBackground,
    "--user-theme-switcher-dot": tokens.switcherGradient,
    "--user-theme-status-text": tokens.statusTextColor,
    "--user-theme-title-gradient": tokens.titleGradient,
    "--user-theme-subtitle-text": tokens.subtitleTextColor,
    "--user-theme-avatar-bg": tokens.avatar.background,
    "--user-theme-avatar-color": tokens.avatar.color,
    "--user-theme-badge-bg": tokens.balanceBadge.background,
    "--user-theme-badge-color": tokens.balanceBadge.color,
    "--user-theme-balance-text": tokens.balanceTextColor,
    "--user-theme-section-text": tokens.sectionTextColor,
    "--user-theme-action-text": tokens.actionTextColor,
    "--user-theme-budget-bar-1": tokens.budgetBarGradients[0],
    "--user-theme-budget-bar-2": tokens.budgetBarGradients[1],
    "--user-theme-budget-bar-3": tokens.budgetBarGradients[2],
    "--user-theme-negative-amount": tokens.negativeAmountColor,
    "--user-theme-secondary-text": tokens.secondaryTextColor,
    "--user-theme-stat-value-1": tokens.statValueColors[0],
    "--user-theme-stat-value-2": tokens.statValueColors[1],
    "--user-theme-bottom-nav-active": tokens.bottomNavigation.activeColor,
    "--user-theme-bottom-nav-active-bg":
      tokens.bottomNavigation.activeBackground,
    "--user-theme-bottom-nav-inactive": tokens.bottomNavigation.inactiveColor,
    "--user-theme-fab-bg": tokens.floatingActionButton.background,
    "--user-theme-fab-shadow": tokens.floatingActionButton.shadowColor,
    "--user-theme-fab-text": tokens.floatingActionButton.textColor,
    "--user-theme-tx-name": tokens.transactionText.nameColor,
    "--user-theme-tx-meta": tokens.transactionText.metaColor,
    "--user-theme-tx-summary-bg": transactionTokens.summaryBackground,
    "--user-theme-tx-nav-bg": transactionTokens.navBackground,
    "--user-theme-tx-avatar-bg": transactionTokens.avatarBackground,
    "--user-theme-tx-accent": transactionTokens.accent,
    "--user-theme-tx-border": transactionTokens.border,
  } as const;
}

export const defaultUserThemeCssVariables =
  getUserThemeCssVariables(defaultUserThemeKey);
