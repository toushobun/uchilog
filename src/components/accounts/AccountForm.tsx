import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  accountTypeOptions,
  type AccountHolderOption,
} from "accounts-route/types";

import { AccountHolderCheckboxGroup } from "./AccountHolderCheckboxGroup";

type AccountFormProps = {
  createAccountAction: (formData: FormData) => void | Promise<void>;
  defaultCurrency: string;
  holderOptions: AccountHolderOption[];
};

export function AccountForm({
  createAccountAction,
  defaultCurrency,
  holderOptions,
}: AccountFormProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        新增账户
      </Typography>

      <Stack
        component="form"
        action={createAccountAction}
        spacing={2.5}
        sx={{ mt: 3 }}
      >
        <TextField
          autoComplete="off"
          fullWidth
          label="账户名称"
          name="name"
          placeholder="例如：现金、三井住友、PayPay"
          required
        />

        <TextField
          defaultValue="cash"
          fullWidth
          label="账户类型"
          name="type"
          required
          select
        >
          {accountTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          defaultValue="0"
          fullWidth
          label="初始余额"
          name="initialBalance"
          slotProps={{ htmlInput: { inputMode: "decimal" } }}
          type="text"
        />

        <TextField
          defaultValue={defaultCurrency}
          fullWidth
          helperText="默认使用当前账本的基础货币。"
          label="货币"
          name="currency"
          required
          slotProps={{ htmlInput: { maxLength: 3 } }}
        />

        <AccountHolderCheckboxGroup holderOptions={holderOptions} />

        <Button type="submit" variant="contained">
          新增账户
        </Button>
      </Stack>
    </Paper>
  );
}
