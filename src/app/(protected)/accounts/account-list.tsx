import Stack from "@mui/material/Stack";

import { EmptyState } from "@/components/ui/EmptyState";
import { archiveAccount } from "./actions";
import { AccountCard } from "./account-card";
import { AccountEditForm } from "./account-edit-form";
import { ArchiveAccountButton } from "./archive-account-button";
import { type AccountRow } from "./types";

type AccountListProps = {
  accounts: AccountRow[];
};

export function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return <EmptyState title="还没有账户" description="请先新增一个账户。" />;
  }

  return (
    <Stack spacing={2.5} sx={{ mt: 4 }}>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          name={account.name}
          type={account.type}
          currency={account.currency}
          holders={account.holders}
          initialBalance={account.initial_balance}
          currentBalance={account.current_balance}
          actions={
            <Stack
              component="form"
              action={archiveAccount}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              <input name="accountId" type="hidden" value={account.id} />
              <ArchiveAccountButton />
            </Stack>
          }
          footer={<AccountEditForm account={account} />}
        />
      ))}
    </Stack>
  );
}
