import { AccountsHome } from "accounts-page/AccountsHome";
import { loadAccountsView } from "server/loaders/accounts";

type AccountsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  account_invalid: "账户指定不正确。",
  archive_failed: "账户归档失败。",
  create_failed: "账户新增失败。请确认账户名称是否重复，或稍后重试。",
  update_failed: "账户更新失败。请确认账户名称是否重复，或稍后重试。",
  currency_invalid: "货币必须是 3 位大写字母，例如 JPY。",
  holder_invalid: "账户持有人指定不正确。",
  initial_balance_invalid: "初始余额必须是数字。",
  name_required: "请输入账户名称。",
  type_invalid: "账户类型不正确。",
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const params = await searchParams;
  const errorMessage = params.error
    ? (errorMessages[params.error] ?? null)
    : null;
  const view = await loadAccountsView();

  return <AccountsHome errorMessage={errorMessage} {...view} />;
}
