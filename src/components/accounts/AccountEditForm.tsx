import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import {
  accountTypeOptions,
  type AccountHolderOption,
  type AccountRow,
} from "accounts-route/types";

import { AccountHolderCheckboxGroup } from "./AccountHolderCheckboxGroup";

type AccountEditFormProps = {
  account: AccountRow;
  holderOptions: AccountHolderOption[];
  updateAccountAction: (formData: FormData) => void | Promise<void>;
};

export function AccountEditForm({
  account,
  holderOptions,
  updateAccountAction,
}: AccountEditFormProps) {
  const selectableHolderUserIds = new Set(
    holderOptions.map((option) => option.user_id),
  );
  const preservedHolderOptions = account.holders
    .filter((holder) => !selectableHolderUserIds.has(holder.user_id))
    .map((holder) => ({
      user_id: holder.user_id,
      display_name: holder.display_name,
      email: holder.email,
    }));

  return (
    <Stack
      component="form"
      action={updateAccountAction}
      spacing={2}
      sx={{ mt: 3 }}
    >
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

      <AccountHolderCheckboxGroup
        holderOptions={holderOptions}
        preservedHolderOptions={preservedHolderOptions}
        selectedUserIds={account.holders.map((holder) => holder.user_id)}
      />

      <Button type="submit" variant="outlined">
        保存修改
      </Button>
    </Stack>
  );
}
