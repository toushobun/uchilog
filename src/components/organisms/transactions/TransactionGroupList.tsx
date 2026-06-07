import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionRow } from "transactions-molecules/TransactionRow";
import {
  transactionExpenseColor,
  transactionIncomeColor,
} from "theme/transactionColors";
import type { TransactionDateGroup } from "types/transactions";
import { formatSignedNumber } from "utils/transactions";

type TransactionGroupListProps = {
  groups: TransactionDateGroup[];
  voidAction?: (formData: FormData) => void;
};

export function TransactionGroupList({
  groups,
  voidAction,
}: TransactionGroupListProps) {
  return (
    <Stack
      sx={{
        left: { xs: "50%", sm: "auto" },
        overflow: "hidden",
        position: { xs: "relative", sm: "static" },
        transform: { xs: "translateX(-50%)", sm: "none" },
        width: { xs: "100vw", sm: "auto" },
      }}
    >
      {groups.map((group) => (
        <Box key={group.date}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              px: 1.6,
              py: 0.8,
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ fontSize: 13, fontWeight: 800 }}
            >
              {group.label}
            </Typography>
            <Typography
              sx={{
                color:
                  Number(group.summary.balance) >= 0
                    ? transactionIncomeColor
                    : transactionExpenseColor,
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {formatSignedNumber(group.summary.balance)}
            </Typography>
          </Stack>

          <Stack
            divider={<Divider flexItem sx={{ ml: 7.2 }} />}
            sx={{
              bgcolor: "background.paper",
              boxShadow: "0 10px 24px rgba(77, 55, 120, 0.05)",
              overflow: "hidden",
              px: 1.6,
            }}
          >
            {group.items.map((item) => (
              <TransactionRow
                item={item}
                key={item.id}
                showAccount
                showTime
                showNote
                showRecorder
                voidAction={voidAction}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
