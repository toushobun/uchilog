import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

type MerchantAliasFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  merchantId: string;
};

export function MerchantAliasForm({
  action,
  merchantId,
}: MerchantAliasFormProps) {
  return (
    <Stack component="form" action={action} spacing={1.5} sx={{ mt: 2 }}>
      <input name="merchantId" type="hidden" value={merchantId} />

      <TextField
        autoComplete="off"
        fullWidth
        slotProps={{ htmlInput: { maxLength: 100 } }}
        label="新增别名"
        name="alias"
        placeholder="例如：来福、LIFE、スギ"
        required
        size="small"
      />

      <Button size="small" type="submit" variant="outlined">
        新增别名
      </Button>
    </Stack>
  );
}
