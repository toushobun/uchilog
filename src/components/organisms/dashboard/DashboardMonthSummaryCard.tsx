import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { receiptCardBorder, receiptTextColor } from "theme/receiptColors";
import type { DashboardAccountSummary } from "types/dashboard";
import { formatAmount } from "utils/accounts";

const cardBorder = receiptCardBorder;
const rowBorder = "rgba(133, 77, 14, 0.1)";
const textColor = receiptTextColor;

const accountIconStyles = {
  bank: {
    bgcolor: "#22c55e",
    icon: <AccountBalanceWalletRoundedIcon fontSize="small" />,
  },
  cash: {
    bgcolor: "#94a3b8",
    icon: <PaymentsRoundedIcon fontSize="small" />,
  },
  credit_card: {
    bgcolor: "#b45309",
    icon: <CreditCardRoundedIcon fontSize="small" />,
  },
  e_money: {
    bgcolor: "#2563eb",
    icon: <SmartphoneRoundedIcon fontSize="small" />,
  },
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
    <Box
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.86)",
        border: `1px solid ${cardBorder}`,
        borderRadius: 1.25,
        boxShadow: "0 8px 18px rgba(120, 53, 15, 0.05)",
        overflow: "hidden",
        p: 1.5,
      }}
    >
      <Stack spacing={1.1}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography sx={{ color: textColor, fontSize: 15, fontWeight: 900 }}>
            账户余额
          </Typography>
          <Typography sx={{ color: "rgba(74, 47, 27, 0.48)", fontSize: 12 }}>
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
                  borderTop: `1px solid ${rowBorder}`,
                  minHeight: 40,
                  py: 0.75,
                }}
              >
                <Box
                  sx={{
                    alignItems: "center",
                    bgcolor: getAccountIconStyle(account.type).bgcolor,
                    borderRadius: 0.75,
                    color: "white",
                    display: "inline-flex",
                    flexShrink: 0,
                    height: 28,
                    justifyContent: "center",
                    width: 28,
                  }}
                >
                  {getAccountIconStyle(account.type).icon}
                </Box>
                <Typography
                  noWrap
                  sx={{
                    color: textColor,
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {account.name}
                </Typography>
                <Typography
                  sx={{ color: textColor, fontSize: 13, fontWeight: 900 }}
                >
                  {formatAmount(account.balance, account.currency)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography sx={{ color: "rgba(74, 47, 27, 0.52)", fontSize: 12 }}>
            还没有账户余额数据。
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function getAccountIconStyle(type: string) {
  return (
    accountIconStyles[type as keyof typeof accountIconStyles] ??
    accountIconStyles.bank
  );
}
