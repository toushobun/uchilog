import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { AccountHolderCheckboxGroup } from "molecules/accounts/AccountHolderCheckboxGroup";
import { FormActions } from "molecules/ui/FormActions";

import type { ServerAction } from "types/actions";
import { accountTypeOptions, type AccountHolderOption } from "types/accounts";

type AccountFormProps = {
  createAccountAction: ServerAction;
  defaultCurrency: string;
  holderOptions: AccountHolderOption[];
  title?: ReactNode;
};

export function AccountForm({
  createAccountAction,
  defaultCurrency,
  holderOptions,
  title = "新增账户",
}: AccountFormProps) {
  return (
    <Stack spacing={3}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Stack component="form" action={createAccountAction} spacing={2.5}>
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

        <FormActions>
          <Button type="submit" variant="contained">
            新增账户
          </Button>
        </FormActions>
      </Stack>
    </Stack>
  );
}
