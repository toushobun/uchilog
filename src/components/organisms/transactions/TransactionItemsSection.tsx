import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { RefObject } from "react";

import { designTokens } from "theme/theme";

import type {
  TransactionFormItem,
  TransactionItemSummary,
} from "./TransactionForm.types";
import { smallIconButtonSx } from "./TransactionForm.styles";
import { formatCategoryName } from "./TransactionForm.utils";

type TransactionItemsSectionProps = {
  fieldError?: string;
  hasCategoryOptions: boolean;
  itemsFieldRef: RefObject<HTMLDivElement | null>;
  itemSummaries: TransactionItemSummary[];
  onOpenSheet: () => void;
  onRemoveItem: (itemId: number) => void;
  onUpdateItem: (
    itemId: number,
    values: Partial<Omit<TransactionFormItem, "id">>,
  ) => void;
  selectedAccountCurrency?: string;
  signedTotalAmount: string;
};

export function TransactionItemsSection({
  fieldError,
  hasCategoryOptions,
  itemsFieldRef,
  itemSummaries,
  onOpenSheet,
  onRemoveItem,
  onUpdateItem,
  selectedAccountCurrency,
  signedTotalAmount,
}: TransactionItemsSectionProps) {
  return (
    <Paper ref={itemsFieldRef} variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          消费明细
        </Typography>

        {itemSummaries.length === 0 ? (
          <Typography
            color={fieldError ? "error" : "text.secondary"}
            variant="body2"
            sx={{ py: 0.5 }}
          >
            {fieldError ?? "请点击下方按钮添加明细。"}
          </Typography>
        ) : (
          itemSummaries.map((item, index) => {
            const categoryLabel = item.category
              ? formatCategoryName(item.category)
              : "请选择分类";

            return (
              <Paper key={item.id} elevation={0} sx={subtlePaperSx}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", minHeight: 48 }}
                >
                  <input
                    name="itemCategoryId"
                    type="hidden"
                    value={item.categoryId}
                  />
                  <Typography noWrap sx={{ flex: 1, fontWeight: 700 }}>
                    {categoryLabel}
                  </Typography>
                  <TextField
                    hiddenLabel
                    name="itemAmount"
                    onChange={(event) =>
                      onUpdateItem(item.id, { amount: event.target.value })
                    }
                    placeholder="0"
                    size="small"
                    slotProps={{
                      htmlInput: {
                        "aria-label": `明细 ${index + 1} 金额`,
                        "data-amount-currency": selectedAccountCurrency ?? "",
                        "data-amount-input": "true",
                        inputMode: "decimal",
                        sx: { textAlign: "right" },
                      },
                      input: {
                        disableUnderline: true,
                      },
                    }}
                    type="text"
                    value={item.amount}
                    variant="standard"
                    sx={amountFieldSx}
                  />
                  <IconButton
                    aria-label={`删除明细 ${index + 1}`}
                    onClick={() => onRemoveItem(item.id)}
                    size="small"
                    sx={smallIconButtonSx}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            );
          })
        )}

        <Button
          aria-label="添加明细"
          disabled={!hasCategoryOptions}
          onClick={onOpenSheet}
          type="button"
          variant="text"
          sx={addItemButtonSx}
        >
          + 添加一项明细
        </Button>

        {itemSummaries.length > 0 ? (
          <Box sx={summaryBoxSx}>
            <Typography sx={{ fontWeight: 700 }}>
              共 {itemSummaries.length} 项
            </Typography>
            <Typography
              sx={{
                color: "var(--user-theme-action-text)",
                fontWeight: 800,
              }}
            >
              合计 {signedTotalAmount}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

const subtlePaperSx = {
  bgcolor: designTokens.color.background.subtle,
  borderRadius: 2,
  px: 1.5,
  py: 1,
};

const amountFieldSx = {
  width: 96,
  "& .MuiInputBase-root": {
    bgcolor: "transparent",
    fontSize: "1.25rem",
    fontWeight: 800,
  },
};

const addItemButtonSx = {
  border: "2px dashed",
  borderColor: "var(--user-theme-action-text)",
  borderRadius: 2,
  color: "var(--user-theme-action-text)",
  minHeight: 48,
};

const summaryBoxSx = {
  bgcolor: designTokens.color.background.subtle,
  borderRadius: 2,
  display: "flex",
  justifyContent: "space-between",
  px: 2,
  py: 1.25,
};
