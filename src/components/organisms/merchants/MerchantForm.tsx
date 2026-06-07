import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { GlassCard } from "ui/GlassCard";

type MerchantFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function MerchantForm({ action }: MerchantFormProps) {
  return (
    <GlassCard sx={{ mt: 4, p: 3 }}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        新增商家
      </Typography>

      <Stack component="form" action={action} spacing={2.5} sx={{ mt: 3 }}>
        <TextField
          autoComplete="off"
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100 } }}
          label="商家名称"
          name="name"
          placeholder="例如：LIFE、スギ薬局、Amazon"
          required
        />

        <TextField
          autoComplete="off"
          fullWidth
          helperText="本期仅保存和展示网址，不自动读取 logo。"
          label="商家网址"
          name="websiteUrl"
          placeholder="https://example.com"
          type="url"
        />

        <TextField
          fullWidth
          slotProps={{ htmlInput: { maxLength: 1000 } }}
          label="备注"
          minRows={3}
          multiline
          name="note"
          placeholder="例如：常去的超市、药妆店、网购平台等"
        />

        <Button type="submit" variant="contained">
          新增商家
        </Button>
      </Stack>
    </GlassCard>
  );
}
