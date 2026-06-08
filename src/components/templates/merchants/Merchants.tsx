import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { MerchantForm } from "organisms/merchants/MerchantForm";
import { MerchantList } from "organisms/merchants/MerchantList";
import type { ServerAction } from "types/actions";
import type { MerchantRow } from "types/merchants";
import { PageCard } from "molecules/ui/PageCard";

type MerchantsTemplateProps = {
  archiveMerchantAction: ServerAction;
  archiveMerchantAliasAction: ServerAction;
  createMerchantAction: ServerAction;
  createMerchantAliasAction: ServerAction;
  errorMerchantId: string | null;
  errorMessage: string | null;
  keyword: string;
  ledgerName: string;
  merchants: MerchantRow[];
  updateMerchantAction: ServerAction;
};

export function MerchantsTemplate({
  archiveMerchantAction,
  archiveMerchantAliasAction,
  createMerchantAction,
  createMerchantAliasAction,
  errorMerchantId,
  errorMessage,
  keyword,
  ledgerName,
  merchants,
  updateMerchantAction,
}: MerchantsTemplateProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        商家
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        管理常用商家、商家网址、备注和别名。UchiLog
        会以商家为主轴，再结合分类进行统计。
      </Typography>

      {errorMessage && !errorMerchantId ? (
        <Typography color="error" role="alert" sx={{ mt: 3 }}>
          {errorMessage}
        </Typography>
      ) : null}

      <PageCard component="form" sx={{ mt: 4, p: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            defaultValue={keyword}
            fullWidth
            helperText="同时匹配商家主名称和别名。"
            label="搜索商家"
            name="q"
            placeholder="例如：LIFE、来福、スギ"
          />
          <Button
            sx={{ alignSelf: "flex-start" }}
            type="submit"
            variant="outlined"
          >
            搜索
          </Button>
        </Stack>
      </PageCard>

      <MerchantForm action={createMerchantAction} />
      <MerchantList
        archiveAliasAction={archiveMerchantAliasAction}
        archiveMerchantAction={archiveMerchantAction}
        createAliasAction={createMerchantAliasAction}
        errorMerchantId={errorMerchantId}
        errorMessage={errorMessage}
        merchants={merchants}
        updateMerchantAction={updateMerchantAction}
      />
    </PageCard>
  );
}
