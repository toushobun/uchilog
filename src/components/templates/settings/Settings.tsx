import Stack from "@mui/material/Stack";

import { SettingsOverviewCard } from "organisms/settings/SettingsOverviewCard";
import { SettingsThemeSection } from "organisms/settings/SettingsThemeSection";
import { SettingsAccountsEntry } from "molecules/settings/SettingsAccountsEntry";
import { SettingsCategoriesEntry } from "molecules/settings/SettingsCategoriesEntry";
import type { ServerAction } from "types/actions";

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
    <Stack spacing={3}>
      <SettingsOverviewCard
        currentLedgerName={currentLedgerName}
        email={email}
        logoutAction={logoutAction}
      />
      <SettingsAccountsEntry />
      <SettingsCategoriesEntry />
      <SettingsThemeSection />
    </Stack>
  );
}
