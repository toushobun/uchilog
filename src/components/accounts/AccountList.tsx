import Stack from "@mui/material/Stack";

import { EmptyState } from "@/components/ui/EmptyState";
import {
  type AccountHolderOption,
  type AccountRow,
} from "accounts-route/types";

import { AccountCard } from "./AccountCard";
import { AccountEditForm } from "./AccountEditForm";
import { ArchiveAccountButton } from "./ArchiveAccountButton";

type AccountListProps = {
  accounts: AccountRow[];
  archiveAccountAction: (formData: FormData) => void | Promise<void>;
  holderOptions: AccountHolderOption[];
  updateAccountAction: (formData: FormData) => void | Promise<void>;
};

export function AccountList({
  accounts,
  archiveAccountAction,
  holderOptions,
  updateAccountAction,
}: AccountListProps) {
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
              action={archiveAccountAction}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              <input name="accountId" type="hidden" value={account.id} />
              <ArchiveAccountButton />
            </Stack>
          }
          footer={
            <AccountEditForm
              account={account}
              holderOptions={holderOptions}
              updateAccountAction={updateAccountAction}
            />
          }
        />
      ))}
    </Stack>
  );
}
