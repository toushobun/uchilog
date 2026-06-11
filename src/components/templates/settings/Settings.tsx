import { SettingsOverviewCard } from "organisms/settings/SettingsOverviewCard";
import { SettingsThemeSection } from "organisms/settings/SettingsThemeSection";
import { SettingsAccountsEntry } from "molecules/settings/SettingsAccountsEntry";
import { SettingsCategoriesEntry } from "molecules/settings/SettingsCategoriesEntry";
import type { ServerAction } from "types/actions";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

type SettingsTemplateProps = {
  currentLedgerName: string;
  email: string;
  logoutAction: ServerAction;
};

export function SettingsTemplate({
  currentLedgerName,
  email,
  logoutAction,
}: SettingsTemplateProps) {
  return (
    <PageShell>
      <PageHeader title="设置" subtitle="管理账号信息、账本入口和个人主题。" />

      <SettingsOverviewCard
        currentLedgerName={currentLedgerName}
        email={email}
        logoutAction={logoutAction}
      />
      <SettingsAccountsEntry />
      <SettingsCategoriesEntry />
      <SettingsThemeSection />
    </PageShell>
  );
}
