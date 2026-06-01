import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { createAccount } from "./actions";
import { accountTypeOptions } from "./types";

type AccountFormProps = {
  defaultCurrency: string;
};

export function AccountForm({ defaultCurrency }: AccountFormProps) {
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

      <Stack component="form" action={createAccount} spacing={2.5} sx={{ mt: 3 }}>
        <TextField
          autoComplete="off"
          fullWidth
          label="账户名称"
          name="name"
          placeholder="例如：现金、三井住友、PayPay"
          required
        />

        <TextField defaultValue="cash" fullWidth label="账户类型" name="type" required select>
          {accountTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          defaultValue="0"
          fullWidth
          inputProps={{ step: "0.01" }}
          label="初始余额"
          name="initialBalance"
          type="number"
        />

        <TextField
          defaultValue={defaultCurrency}
          fullWidth
          helperText="MVP 阶段默认使用当前账本的基础货币。"
          inputProps={{ maxLength: 3 }}
          label="货币"
          name="currency"
          required
        />

        <TextField
          defaultValue="0"
          fullWidth
          helperText="数字越小越靠前。"
          label="排序顺序"
          name="sortOrder"
          type="number"
        />

        <Button type="submit" variant="contained">
          新增账户
        </Button>
      </Stack>
    </Paper>
  );
}
