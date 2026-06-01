import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";

import { createLedger } from "./actions";

type LedgerSetupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "name_required") {
    return "请输入账本名称。";
  }

  if (error === "currency_invalid") {
    return "基础货币必须是 3 位大写字母，例如 JPY。";
  }

  if (error === "create_failed") {
    return "账本创建失败，请稍后重试。";
  }

  return null;
}

export default async function LedgerSetupPage({
  searchParams,
}: LedgerSetupPageProps) {
  const { currentLedger } = await getCurrentLedgerContext();

  if (currentLedger) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        初始化账本
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        你还没有可用账本。请先创建一个账本，后续账户、分类和记账记录都会归属于该账本。
      </Typography>

      <Stack component="form" action={createLedger} spacing={3} sx={{ mt: 4 }}>
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
    </Paper>
  );
}
