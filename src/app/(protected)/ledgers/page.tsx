import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { redirect } from "next/navigation";

import { getCurrentLedgerContext } from "@/lib/ledger/current-ledger";

export default async function LedgersPage() {
  const { ledgers, currentLedger } = await getCurrentLedgerContext();

  if (!currentLedger) {
    redirect("/ledger-setup");
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 4, sm: 5 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
        账本
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 2 }}>
        当前 MVP 阶段默认使用列表中的第一个账本。正式的账本切换功能将在后续
        Issue 中实现。
      </Typography>

      <List sx={{ mt: 3 }}>
        {ledgers.map((ledger) => (
          <ListItem
            key={ledger.id}
            disableGutters
            secondaryAction={
              ledger.id === currentLedger.id ? (
                <Chip color="primary" label="当前" size="small" />
              ) : null
            }
          >
            <ListItemText
              primary={ledger.name}
              secondary={`基础货币：${ledger.baseCurrency}`}
            />
          </ListItem>
        ))}
      </List>

      <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
        多账本切换和成员管理将在后续版本中完善。
      </Typography>
    </Paper>
  );
}
