import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { getCurrentLedgerOrRedirect } from "@/lib/ledger/current-ledger";
import { createClient } from "@/lib/supabase/server";

import { MerchantForm } from "./merchant-form";
import { MerchantList } from "./merchant-list";
import {
  normalizeSearchText,
  type MerchantAliasRow,
  type MerchantRow,
} from "./types";

type MerchantsPageProps = {
  searchParams: Promise<{
    error?: string;
    merchantId?: string;
    q?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  alias_archive_failed: "商家别名归档失败。",
  alias_create_failed: "商家别名新增失败。请确认别名是否重复，或稍后重试。",
  alias_invalid: "商家别名指定不正确。",
  alias_required: "请输入商家别名。",
  alias_too_long: "商家别名不能超过 100 个字符。",
  archive_failed: "商家归档失败。",
  create_failed: "商家新增失败。请确认商家名称是否重复，或稍后重试。",
  merchant_invalid: "商家指定不正确。",
  name_required: "请输入商家名称。",
  name_too_long: "商家名称不能超过 100 个字符。",
  note_too_long: "备注不能超过 1000 个字符。",
  update_failed: "商家更新失败。请确认商家名称是否重复，或稍后重试。",
  website_url_invalid: "商家网址必须以 http:// 或 https:// 开头。",
};

function attachAliases(
  merchants: MerchantRow[],
  aliases: MerchantAliasRow[],
): MerchantRow[] {
  const aliasesByMerchantId = new Map<string, MerchantAliasRow[]>();

  for (const alias of aliases) {
    const currentAliases = aliasesByMerchantId.get(alias.merchant_id) ?? [];
    currentAliases.push(alias);
    aliasesByMerchantId.set(alias.merchant_id, currentAliases);
  }

  return merchants.map((merchant) => ({
    ...merchant,
    aliases: aliasesByMerchantId.get(merchant.id) ?? [],
  }));
}

function filterMerchantsByKeyword(merchants: MerchantRow[], keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);

  if (normalizedKeyword.length === 0) {
    return merchants;
  }

  return merchants.filter((merchant) => {
    const matchedByName = normalizeSearchText(merchant.name).includes(
      normalizedKeyword,
    );
    const matchedByAlias = merchant.aliases.some((alias) =>
      normalizeSearchText(alias.alias).includes(normalizedKeyword),
    );

    return matchedByName || matchedByAlias;
  });
}

export default async function MerchantsPage({
  searchParams,
}: MerchantsPageProps) {
  const currentLedger = await getCurrentLedgerOrRedirect();
  const params = await searchParams;
  const keyword = params.q ?? "";
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const errorMerchantId = params.merchantId ?? null;
  const supabase = await createClient();

  const { data: merchantData, error: merchantError } = await supabase
    .from("merchant")
    .select("id, name, website_url, icon_url, note, sort_order, created_at")
    .eq("ledger_id", currentLedger.id)
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (merchantError) {
    throw new Error("Failed to load merchants");
  }

  const merchantsWithoutAliases = (merchantData ?? []).map((merchant) => ({
    ...merchant,
    aliases: [],
  })) as MerchantRow[];
  const merchantIds = merchantsWithoutAliases.map((merchant) => merchant.id);

  const { data: aliasData, error: aliasError } = merchantIds.length
    ? await supabase
        .from("merchant_alias")
        .select("id, merchant_id, alias, sort_order, created_at")
        .in("merchant_id", merchantIds)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (aliasError) {
    throw new Error("Failed to load merchant aliases");
  }

  const merchants = filterMerchantsByKeyword(
    attachAliases(
      merchantsWithoutAliases,
      (aliasData ?? []) as MerchantAliasRow[],
    ),
    keyword,
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        商家
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{currentLedger.name}
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

      <Paper
        component="form"
        elevation={0}
        sx={{ mt: 4, p: 3, border: "1px solid", borderColor: "divider" }}
      >
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
      </Paper>

      <MerchantForm />
      <MerchantList
        errorMerchantId={errorMerchantId}
        errorMessage={errorMessage}
        merchants={merchants}
      />
    </Paper>
  );
}
