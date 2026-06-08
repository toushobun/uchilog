import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { PageCard } from "molecules/ui/PageCard";
import type { ServerAction } from "types/actions";

type LedgerSetupTemplateProps = {
  createLedgerAction: ServerAction;
  errorMessage: string | null;
};

export function LedgerSetupTemplate({
  createLedgerAction,
  errorMessage,
}: LedgerSetupTemplateProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        初始化账本
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        你还没有可用账本。请先创建一个账本，后续账户、分类和记账记录都会归属于该账本。
      </Typography>

      <Stack
        component="form"
        action={createLedgerAction}
        spacing={3}
        sx={{ mt: 4 }}
      >
        <TextField
          autoComplete="off"
          defaultValue="家庭账本"
          fullWidth
          label="账本名称"
          name="name"
          required
        />

        <TextField
          autoComplete="off"
          defaultValue="JPY"
          fullWidth
          helperText="MVP 阶段先使用 JPY，后续再扩展多币种设置。"
          label="基础货币"
          name="baseCurrency"
          required
        />

        {errorMessage ? (
          <Typography color="error" role="alert">
            {errorMessage}
          </Typography>
        ) : null}

        <Button type="submit" variant="contained">
          创建账本
        </Button>
      </Stack>
    </PageCard>
  );
}
