import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { archiveAccount } from "./actions";
import { AccountEditForm } from "./account-edit-form";
import { ArchiveAccountButton } from "./archive-account-button";
import { formatAmount, getAccountTypeLabel, type AccountRow } from "./types";

type AccountListProps = {
  accounts: AccountRow[];
};

export function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{ mt: 4, p: 3, border: "1px dashed", borderColor: "divider" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          还没有账户
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          请先新增一个账户。
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ mt: 4 }}>
      {accounts.map((account) => (
        <Paper
          key={account.id}
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap" }}
              >
                <Typography
                  component="h2"
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  {account.name}
                </Typography>
                <Chip label={getAccountTypeLabel(account.type)} size="small" />
              </Stack>

              <Typography color="text.secondary">
                当前余额：
                {formatAmount(account.current_balance, account.currency)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                初始余额：
                {formatAmount(account.initial_balance, account.currency)}
              </Typography>
            </Stack>

            <Stack
              component="form"
              action={archiveAccount}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              <input name="accountId" type="hidden" value={account.id} />
              <ArchiveAccountButton />
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />
          <AccountEditForm account={account} />
        </Paper>
      ))}
    </Stack>
  );
}
