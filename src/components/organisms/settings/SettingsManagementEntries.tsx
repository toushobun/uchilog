import Stack from "@mui/material/Stack";

import { SettingsAccountsEntry } from "settings-components/SettingsAccountsEntry";
import { SettingsCategoriesEntry } from "settings-components/SettingsCategoriesEntry";

export function SettingsManagementEntries() {
  return (
    <Stack spacing={3}>
      <SettingsAccountsEntry />
      <SettingsCategoriesEntry />
    </Stack>
  );
}
