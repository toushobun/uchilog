import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { SoftCard } from "atoms/ui/SoftCard";
import { routePaths } from "config/paths";
import { typographyStyles } from "theme/typographyTokens";

import { settingsEntryButtonSx } from "./settingsEntryButtonSx";

export function SettingsCategoriesEntry() {
  return (
    <SoftCard sx={{ p: { xs: 3, sm: 4 } }}>
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
            分类管理
          </Typography>
          <Typography color="text.secondary" sx={settingsDescriptionSx}>
            管理支出和收入分类，并为记账表单维护可选择的小分类。
          </Typography>
        </Stack>

        <Button
          href={routePaths.categories}
          sx={settingsEntryButtonSx}
          variant="contained"
        >
          打开分类管理
        </Button>
      </Stack>
    </SoftCard>
  );
}

const settingsTitleSx = {
  ...typographyStyles.cardTitle,
};

const settingsDescriptionSx = {
  ...typographyStyles.listText,
};
