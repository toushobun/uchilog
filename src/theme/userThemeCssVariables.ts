import {
  defaultUserThemeKey,
  type KuraThemeToken,
  type UserThemeKey,
  userThemeTokens,
} from "./userThemeTokens";

function createPageBackground(token: KuraThemeToken) {
  const { pageGradientFrom, pageGradientTo } = token.palette;

  return `linear-gradient(180deg, ${pageGradientFrom} 0%, ${pageGradientTo} 100%)`;
}

function createTitleGradient(token: KuraThemeToken) {
  const { accentDeep, accent, accentLight } = token.palette;

  return `linear-gradient(120deg, ${accentDeep}, ${accent}, ${accentLight})`;
}

function createSemanticGradient(background: string, color: string) {
  return `linear-gradient(90deg, ${background}, ${color})`;
}

export function getUserThemeCssVariables(themeKey: UserThemeKey) {
  const token = userThemeTokens[themeKey];
  const { palette, semantic, component } = token;

  return {
    "--user-theme-page-bg": createPageBackground(token),
    "--user-theme-switcher-gradient": component.buttonPrimaryBg,
    "--user-theme-status-text": palette.textMuted,
    "--user-theme-title-gradient": createTitleGradient(token),
    "--user-theme-subtitle-text": palette.textMuted,
    "--user-theme-avatar-bg": component.iconBadgeBg,
    "--user-theme-avatar-color": component.iconBadgeText,
    "--user-theme-badge-bg": component.buttonSecondaryBg,
    "--user-theme-badge-color": component.buttonSecondaryText,
    "--user-theme-balance-text": palette.text,
    "--user-theme-section-text": palette.textMuted,
    "--user-theme-action-text": palette.accent,
    "--user-theme-budget-bar-1": createSemanticGradient(
      semantic.expenseBg,
      semantic.expense,
    ),
    "--user-theme-budget-bar-2": createSemanticGradient(
      semantic.transferBg,
      semantic.transfer,
    ),
    "--user-theme-budget-bar-3": createSemanticGradient(
      semantic.incomeBg,
      semantic.income,
    ),
    "--user-theme-negative-amount": semantic.expense,
    "--user-theme-secondary-text": palette.textMuted,
    "--user-theme-stat-value-1": palette.accentDeep,
    "--user-theme-stat-value-2": palette.accent,
    "--user-theme-bottom-nav-active": palette.accent,
    "--user-theme-bottom-nav-active-bg": palette.accentPale,
    "--user-theme-bottom-nav-inactive": palette.textFaint,
    "--user-theme-fab-bg": component.buttonPrimaryBg,
    "--user-theme-fab-shadow": palette.shadow,
    "--user-theme-fab-text": component.buttonPrimaryText,
    "--user-theme-card-bg": palette.card,
    "--user-theme-card-border": palette.border,
    "--user-theme-card-shadow": `0 3px 18px ${palette.shadow}`,
    "--user-theme-nav-bg": palette.cardElevated,
    "--user-theme-nav-border": palette.border,
    "--user-theme-tx-name": palette.text,
    "--user-theme-tx-meta": palette.textMuted,
    "--user-theme-tx-summary-bg": palette.surfaceAlt,
    "--user-theme-tx-nav-bg": palette.surfaceAlt,
    "--user-theme-tx-avatar-bg": component.iconBadgeBg,
    "--user-theme-tx-accent": palette.accent,
    "--user-theme-tx-border": palette.border,
  } as const;
}

export const defaultUserThemeCssVariables =
  getUserThemeCssVariables(defaultUserThemeKey);
