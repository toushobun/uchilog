import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { updateAccount } from "accounts/actions";
import { accountTypeOptions, type AccountRow } from "accounts/types";

type AccountEditFormProps = {
  account: AccountRow;
};

export function AccountEditForm({ account }: AccountEditFormProps) {
  return (
    <Stack component="form" action={updateAccount} spacing={2} sx={{ mt: 3 }}>
      <input name="accountId" type="hidden" value={account.id} />

      <TextField
        defaultValue={account.name}
        fullWidth
        label="账户名称"
        name="name"
        required
      />

      <TextField
        defaultValue={account.type}
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
        defaultValue={account.currency}
        fullWidth
        label="货币"
        name="currency"
        required
        slotProps={{ htmlInput: { maxLength: 3 } }}
      />

      <Button type="submit" variant="outlined">
        保存修改
      </Button>
    </Stack>
  );
}
