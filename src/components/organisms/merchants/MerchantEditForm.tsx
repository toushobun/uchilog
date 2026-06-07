import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import type { MerchantRow } from "types/merchants";

type MerchantEditFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  merchant: MerchantRow;
};

export function MerchantEditForm({ action, merchant }: MerchantEditFormProps) {
  return (
    <Stack component="form" action={action} spacing={2} sx={{ mt: 3 }}>
      <input name="merchantId" type="hidden" value={merchant.id} />

      <TextField
        defaultValue={merchant.name}
        fullWidth
        slotProps={{ htmlInput: { maxLength: 100 } }}
        label="商家名称"
        name="name"
        required
      />

      <TextField
        defaultValue={merchant.website_url ?? ""}
        fullWidth
        helperText="本期仅保存和展示网址，不自动读取 logo。"
        label="商家网址"
        name="websiteUrl"
        placeholder="https://example.com"
        type="url"
      />

      <TextField
        defaultValue={merchant.note ?? ""}
        fullWidth
        slotProps={{ htmlInput: { maxLength: 1000 } }}
        label="备注"
        minRows={3}
        multiline
        name="note"
      />

      <Button type="submit" variant="outlined">
        保存修改
      </Button>
    </Stack>
  );
}
