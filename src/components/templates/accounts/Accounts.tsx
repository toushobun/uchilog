import Typography from "@mui/material/Typography";

import { AccountForm } from "organisms/accounts/AccountForm";
import { AccountList } from "organisms/accounts/AccountList";
import type { AccountHolderOption, AccountRow } from "types/accounts";
import type { ServerAction } from "types/actions";
import { PageCard } from "molecules/ui/PageCard";

type AccountsTemplateProps = {
  accounts: AccountRow[];
  archiveAccountAction: ServerAction;
  baseCurrency: string;
  createAccountAction: ServerAction;
  errorMessage: string | null;
  holderOptions: AccountHolderOption[];
  ledgerName: string;
  updateAccountAction: ServerAction;
};

export function AccountsTemplate({
  accounts,
  archiveAccountAction,
  baseCurrency,
  createAccountAction,
  errorMessage,
  holderOptions,
  ledgerName,
  updateAccountAction,
}: AccountsTemplateProps) {
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
        createAccountAction={createAccountAction}
        defaultCurrency={baseCurrency}
        holderOptions={holderOptions}
      />
      <AccountList
        accounts={accounts}
        archiveAccountAction={archiveAccountAction}
        holderOptions={holderOptions}
        updateAccountAction={updateAccountAction}
      />
    </PageCard>
  );
}
