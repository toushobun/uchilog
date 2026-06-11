import Typography from "@mui/material/Typography";

import { UserThemePicker } from "molecules/theme/UserThemePicker";
import { PageCard } from "molecules/ui/PageCard";

export function SettingsThemeSection() {
  return (
    <PageCard sx={{ p: { xs: 3, sm: 4 } }}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        个人主题
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        只影响当前登录用户看到的界面氛围，不会改变账本成员显示色。
      </Typography>
      <UserThemePicker />
    </PageCard>
  );
}
