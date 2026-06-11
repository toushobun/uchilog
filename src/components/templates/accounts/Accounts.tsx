import Stack from "@mui/material/Stack";

import { AccountForm } from "organisms/accounts/AccountForm";
import { AccountList } from "organisms/accounts/AccountList";
import type { AccountHolderOption, AccountRow } from "types/accounts";
import type { ServerAction } from "types/actions";
import { ErrorState } from "molecules/ui/ErrorState";
import { SectionCard } from "molecules/ui/SectionCard";
import { PageHeader } from "templates/layout/PageHeader";
import { PageShell } from "templates/layout/PageShell";

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
    <PageShell>
      <PageHeader
        title="账户"
        subtitle={
          <Stack spacing={0.5}>
            <span>当前账本：{ledgerName}</span>
            <span>管理现金、银行账户、信用卡、电子钱包等账户。</span>
          </Stack>
        }
      />

      {errorMessage ? (
        <ErrorState title="账户操作失败" description={errorMessage} />
      ) : null}

      <SectionCard>
        <AccountForm
          createAccountAction={createAccountAction}
          defaultCurrency={baseCurrency}
          holderOptions={holderOptions}
        />
      </SectionCard>

      <AccountList
        accounts={accounts}
        archiveAccountAction={archiveAccountAction}
        holderOptions={holderOptions}
        updateAccountAction={updateAccountAction}
      />
    </PageShell>
  );
}
