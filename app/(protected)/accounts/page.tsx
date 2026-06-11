import {
  archiveAccount,
  createAccount,
  updateAccount,
} from "server/actions/accounts";
import { loadAccountsView } from "server/loaders/accounts";
import { AccountsTemplate } from "templates/accounts/Accounts";
import { getAccountErrorMessage } from "utils/pageErrors";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const view = await loadAccountsView();

  return (
    <AccountsTemplate
      errorMessage={getAccountErrorMessage(params.error)}
      {...view}
      archiveAccountAction={archiveAccount}
      createAccountAction={createAccount}
      updateAccountAction={updateAccount}
    />
  );
}
