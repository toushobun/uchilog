import { MerchantsHome } from "merchants-page/MerchantsHome";
import { loadMerchantsView } from "server/loaders/merchants";

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

export default async function MerchantsPage({
  searchParams,
}: MerchantsPageProps) {
  const params = await searchParams;
  const keyword = params.q ?? "";
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const errorMerchantId = params.merchantId ?? null;
  const view = await loadMerchantsView(keyword);

  return (
    <MerchantsHome
      errorMerchantId={errorMerchantId}
      errorMessage={errorMessage}
      keyword={keyword}
      ledgerName={view.ledgerName}
      merchants={view.merchants}
    />
  );
}
