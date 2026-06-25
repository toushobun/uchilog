import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { IconBadge } from "atoms/ui/IconBadge";
import { SectionCard } from "molecules/ui/SectionCard";
import type { DashboardAccountSummary } from "types/dashboard";
import { formatAmount } from "utils/accounts";

const accountIconMap = {
  bank: <AccountBalanceWalletRoundedIcon fontSize="small" />,
  cash: <PaymentsRoundedIcon fontSize="small" />,
  credit_card: <CreditCardRoundedIcon fontSize="small" />,
  e_money: <SmartphoneRoundedIcon fontSize="small" />,
} as const;

type DashboardMonthSummaryCardProps = {
  accounts: DashboardAccountSummary[];
  monthLabel: string;
};

export function DashboardMonthSummaryCard({
  accounts,
  monthLabel,
}: DashboardMonthSummaryCardProps) {
  return (
    <SectionCard
      sx={{
        borderRadius: 1.25,
        overflow: "hidden",
        p: 1.5,
      }}
    >
      <Stack spacing={1.1}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            sx={{ color: "text.primary", fontSize: 15, fontWeight: 900 }}
          >
            账户余额
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            {monthLabel}
          </Typography>
        </Stack>

        {accounts.length > 0 ? (
          <Stack spacing={0}>
            {accounts.map((account) => (
              <Stack
                direction="row"
                key={account.id}
                spacing={1.1}
                sx={{
                  alignItems: "center",
                  borderTop: "1px solid var(--user-theme-card-border)",
                  minHeight: 40,
                  py: 0.75,
                }}
              >
                <IconBadge
                  size="sm"
                  sx={{
                    borderRadius: 0.75,
                    height: 28,
                    width: 28,
                  }}
                >
                  {getAccountIcon(account.type)}
                </IconBadge>
                <Typography
                  noWrap
                  sx={{
                    color: "text.primary",
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {account.name}
                </Typography>
                <Typography
                  sx={{ color: "text.primary", fontSize: 13, fontWeight: 900 }}
                >
                  {formatAmount(account.balance, account.currency)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
            还没有账户余额数据。
          </Typography>
        )}
      </Stack>
    </SectionCard>
  );
}

function getAccountIcon(type: string) {
  return accountIconMap[type as keyof typeof accountIconMap] ?? accountIconMap.bank;
}
