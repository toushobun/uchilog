import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { SoftCard } from "atoms/ui/SoftCard";
import { routePaths } from "config/paths";
import { typographyStyles } from "theme/typographyTokens";

import { settingsEntryButtonSx } from "./settingsEntryButtonSx";

export function SettingsAccountsEntry() {
  return (
    <SoftCard
      sx={{
        p: { xs: 3, sm: 4 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack spacing={1}>
          <Typography component="h2" variant="h6" sx={settingsTitleSx}>
            账户管理
          </Typography>
          <Typography color="text.secondary" sx={settingsDescriptionSx}>
            管理当前账本的现金、银行卡、信用卡等账户，并可继续新增账户。
          </Typography>
        </Stack>

        <Button
          href={routePaths.accounts}
          sx={settingsEntryButtonSx}
          variant="contained"
        >
          打开账户管理
        </Button>
      </Stack>
    </SoftCard>
  );
}

const settingsTitleSx = {
  ...typographyStyles.cardTitle,
};

const settingsDescriptionSx = {
  ...typographyStyles.settingEntry,
};
