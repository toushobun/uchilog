import { AccountsHome } from "accounts-page/AccountsHome";
import { loadAccountsView } from "server/loaders/accounts";
import { getAccountErrorMessage } from "utils/pageErrors";

type AccountsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const params = await searchParams;
  const view = await loadAccountsView();

  return (
    <AccountsHome
      errorMessage={getAccountErrorMessage(params.error)}
      {...view}
    />
  );
}
