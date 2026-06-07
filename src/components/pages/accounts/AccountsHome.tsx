import Typography from "@mui/material/Typography";

import { AccountForm } from "accounts/AccountForm";
import { AccountList } from "accounts/AccountList";
import {
  archiveAccount,
  createAccount,
  updateAccount,
} from "server/actions/accounts";
import type { AccountHolderOption, AccountRow } from "types/accounts";
import { PageCard } from "ui-molecules/PageCard";

type AccountsHomeProps = {
  accounts: AccountRow[];
  baseCurrency: string;
  errorMessage: string | null;
  holderOptions: AccountHolderOption[];
  ledgerName: string;
};

export function AccountsHome({
  accounts,
  baseCurrency,
  errorMessage,
  holderOptions,
  ledgerName,
}: AccountsHomeProps) {
  return (
    <PageCard>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        账户
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前账本：{ledgerName}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        管理现金、银行账户、信用卡、电子钱包等账户。
      </Typography>

      {errorMessage ? (
        <Typography color="error" role="alert" sx={{ mt: 3 }}>
          {errorMessage}
        </Typography>
      ) : null}

      <AccountForm
        createAccountAction={createAccount}
        defaultCurrency={baseCurrency}
        holderOptions={holderOptions}
      />
      <AccountList
        accounts={accounts}
        archiveAccountAction={archiveAccount}
        holderOptions={holderOptions}
        updateAccountAction={updateAccount}
      />
    </PageCard>
  );
}
