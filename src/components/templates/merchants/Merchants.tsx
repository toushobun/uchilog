import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { ErrorState } from "molecules/ui/ErrorState";
import { SectionCard } from "molecules/ui/SectionCard";
import { MerchantForm } from "organisms/merchants/MerchantForm";
import { MerchantList } from "organisms/merchants/MerchantList";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";
import type { ServerAction } from "types/actions";
import type { MerchantRow } from "types/merchants";

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
    <PageShell>
      <PageHeader
        title="商家"
        subtitle={
          <Stack spacing={0.5}>
            <span>当前账本：{ledgerName}</span>
            <span>
              管理常用商家、商家网址、备注和别名。KuraNote
              会以商家为主轴，再结合分类进行统计。
            </span>
          </Stack>
        }
      />

      {errorMessage && !errorMerchantId ? (
        <ErrorState title="商家操作失败" description={errorMessage} />
      ) : null}

      <SectionCard component="form" sx={{ p: 3 }}>
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
      </SectionCard>

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
    </PageShell>
  );
}
