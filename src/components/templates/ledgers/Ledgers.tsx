import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import type { CurrentLedger } from "lib/ledger/current-ledger";
import { PageCard } from "molecules/ui/PageCard";

type LedgersTemplateProps = {
  currentLedgerId: string;
  ledgers: CurrentLedger[];
};

export function LedgersTemplate({
  currentLedgerId,
  ledgers,
}: LedgersTemplateProps) {
  return (
    <PageCard>
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
              ledger.id === currentLedgerId ? (
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
    </PageCard>
  );
}
